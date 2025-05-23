// @flow
import React, { Component } from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
import { sendExportLaunched } from '../../Utils/Analytics/EventSender';
import { type Build } from '../../Utils/GDevelopServices/Build';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { Column, Line } from '../../UI/Grid';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import CreateProfile from '../../Profile/CreateProfile';
import CurrentUsageDisplayer from '../../Profile/CurrentUsageDisplayer';
import {
  displayProjectErrorsBox,
  getProjectPropertiesErrors,
} from '../../Utils/ProjectErrorsChecker';
import {
  type Quota,
  type UsagePrice,
} from '../../Utils/GDevelopServices/Usage';
import BuildsWatcher from '../Builds/BuildsWatcher';
import { type BuildStep } from '../Builds/BuildStepsProgress';
import { type ExportPipeline } from '../ExportPipeline.flow';
import DismissableAlertMessage from '../../UI/DismissableAlertMessage';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_WEB_EXPORT,
} from '../../Utils/GDevelopServices/Badge';
import { extractGDevelopApiErrorStatusAndCode } from '../../Utils/GDevelopServices/Errors';
import { type EventsFunctionsExtensionsState } from '../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import inc from 'semver/functions/inc';
import Toggle from '../../UI/Toggle';
import AlertMessage from '../../UI/AlertMessage';
import { type GameAndBuildsManager } from '../../Utils/UseGameAndBuildsManager';

type State = {|
  exportStep: BuildStep,
  compressionOutput: any,
  build: ?Build,
  stepCurrentProgress: number,
  stepMaxProgress: number,
  errored: boolean,
  shouldBumpVersionNumber: boolean,
  exportState: any,
  doneFooterOpen: boolean,
|};

type Props = {|
  i18n: I18nType,
  project: gdProject,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  gameAndBuildsManager: GameAndBuildsManager,
  onChangeSubscription: () => void,
  authenticatedUser: AuthenticatedUser,
  eventsFunctionsExtensionsState: EventsFunctionsExtensionsState,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
  setIsNavigationDisabled: (isNavigationDisabled: boolean) => void,
  uiMode?: 'minimal',

  onExportLaunched?: () => void,
  onExportSucceeded?: ({| build: ?Build |}) => Promise<void>,
  onExportErrored?: () => void,
|};

const getIncrementedVersionNumber = (project: gdProject) => {
  return inc(project.getVersion(), 'patch', { loose: true });
};

const getBuildQuota = (
  authenticatedUser: AuthenticatedUser,
  onlineBuildType: ?string
): ?Quota =>
  authenticatedUser.limits && onlineBuildType
    ? authenticatedUser.limits.quotas[onlineBuildType]
    : null;

const getBuildCreditPrice = (
  authenticatedUser: AuthenticatedUser,
  onlineBuildType: ?string
): ?UsagePrice =>
  authenticatedUser.limits && onlineBuildType
    ? authenticatedUser.limits.credits.prices[onlineBuildType]
    : null;

const getErrorMessage = (i18n: I18nType, exportStep: BuildStep) => {
  switch (exportStep) {
    case 'export':
      return i18n._(t`Error while exporting the game.`);
    case 'resources-download':
      return i18n._(
        t`Error while downloading the game resources. Check your internet connection and that all resources of the game are valid in the Resources editor.`
      );
    case 'compress':
      return i18n._(t`Error while compressing the game.`);
    case 'upload':
      return i18n._(
        t`Error while uploading the game. Check your internet connection or try again later.`
      );
    case 'waiting-for-build':
      return i18n._(
        t`Error while building the game. Check the logs of the build for more details.`
      );
    case 'build':
      return i18n._(
        t`Error while building of the game. Check the logs of the build for more details.`
      );
    default:
      return i18n._(
        t`Error while building the game. Try again later. Your internet connection may be slow or one of your resources may be corrupted.`
      );
  }
};

/**
 * A generic UI to launch, monitor the progress and get the result
 * of an export.
 */
export default class ExportLauncher extends Component<Props, State> {
  state = {
    exportStep: '',
    build: null,
    compressionOutput: null,
    stepCurrentProgress: 0,
    stepMaxProgress: 0,
    doneFooterOpen: false,
    errored: false,
    shouldBumpVersionNumber: true,
    exportState: this.props.exportPipeline.getInitialExportState(
      this.props.project
    ),
  };
  _candidateBumpedVersionNumber = '';
  buildsWatcher = new BuildsWatcher();
  launchWholeExport: ({|
    payWithCredits?: boolean,
  |}) => Promise<void>;

  componentWillMount() {
    // Fetch limits when the export launcher is opened, to ensure we display the
    // latest limits.
    this.props.authenticatedUser.onRefreshLimits();
  }

  componentWillUnmount() {
    this.buildsWatcher.stop();
  }

  constructor(props: Props) {
    super(props);
    this._setupAchievementHook();

    this._candidateBumpedVersionNumber = getIncrementedVersionNumber(
      props.project
    );
  }
  componentDidUpdate(prevProps: Props, prevState: State) {
    this._setupAchievementHook();
    if (
      prevState.exportStep !== this.state.exportStep ||
      prevState.errored !== this.state.errored
    ) {
      this.props.setIsNavigationDisabled(
        this.props.exportPipeline.isNavigationDisabled(
          this.state.exportStep,
          this.state.errored
        )
      );
    }
  }

  _setupAchievementHook = () => {
    if (this.props.exportPipeline.name.includes('web')) {
      this.launchWholeExport = addCreateBadgePreHookIfNotClaimed(
        this.props.authenticatedUser,
        TRIVIAL_FIRST_WEB_EXPORT,
        this._launchWholeExport
      );
    } else {
      this.launchWholeExport = this._launchWholeExport;
    }
  };

  _updateStepProgress = (
    stepCurrentProgress: number,
    stepMaxProgress: number
  ) =>
    this.setState({
      stepCurrentProgress,
      stepMaxProgress,
    });

  _startBuildWatch = (authenticatedUser: AuthenticatedUser) => {
    if (!this.state.build) return;

    this.buildsWatcher.start({
      authenticatedUser,
      builds: [this.state.build],
      onBuildUpdated: (build: Build) => {
        if (build.status === 'pending') {
          this.setState({ build });
        } else {
          // Give a bit of delay to ensure the limits are updated on the server,
          // then update everything.
          setTimeout(() => {
            this.setState({ build });
            authenticatedUser.onRefreshLimits();
            this.props.gameAndBuildsManager.refreshBuilds();
          }, 3000);
        }
      },
    });
  };

  _launchWholeExport = async ({
    payWithCredits,
  }: {|
    payWithCredits?: boolean,
  |}): Promise<void> => {
    const {
      i18n,
      project,
      exportPipeline,
      eventsFunctionsExtensionsState,
      authenticatedUser,
      gameAndBuildsManager,
    } = this.props;
    sendExportLaunched(exportPipeline.name);

    if (
      !displayProjectErrorsBox(i18n, getProjectPropertiesErrors(i18n, project))
    )
      return;

    const setStep = (step: BuildStep) => this.setState({ exportStep: step });

    if (this.props.onExportLaunched) this.props.onExportLaunched();

    try {
      setStep('register');
      // We await for this call, allowing to link the build to the game just registered.
      await gameAndBuildsManager.registerGameIfNeeded();
    } catch (registerError) {
      // But if it fails, we don't prevent building the game.
      console.warn('Error while registering the game.');
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        registerError
      );
      if (
        extractedStatusAndCode &&
        extractedStatusAndCode.code === 'game-creation/too-many-games'
      ) {
        showErrorBox({
          message: [
            i18n._(
              t`You have reached the maximum number of games you can register! You can unregister games in your Games Dashboard.`
            ),
            i18n._(
              t`A link or file will be created but the game will not be registered.`
            ),
          ].join('\n\n'),
          rawError: registerError,
          errorId: 'too-many-games-register',
        });
      }
    }

    try {
      const exportPipelineContext = {
        project,
        updateStepProgress: this._updateStepProgress,
        exportState: this.state.exportState,
      };

      if (
        exportPipeline.shouldSuggestBumpingVersionNumber &&
        exportPipeline.shouldSuggestBumpingVersionNumber() &&
        this.state.shouldBumpVersionNumber
      ) {
        project.setVersion(this._candidateBumpedVersionNumber);
      }

      setStep('export');
      this.setState({
        stepCurrentProgress: 0,
        stepMaxProgress: 0,
        errored: false,
        build: null,
      });
      const preparedExporter = await exportPipeline.prepareExporter(
        exportPipelineContext
      );
      const { profile } = authenticatedUser;

      const fallbackAuthor = profile
        ? {
            username: profile.username || '',
            id: profile.id,
          }
        : undefined;

      await eventsFunctionsExtensionsState.ensureLoadFinished();

      const exportOutput = await exportPipeline.launchExport(
        exportPipelineContext,
        preparedExporter,
        fallbackAuthor
      );
      setStep('resources-download');
      // TODO: use a GenericRetryableProcessWithProgressDialog to show errors
      // and allow to try again?
      const resourcesDownloadOutput = await exportPipeline.launchResourcesDownload(
        exportPipelineContext,
        exportOutput
      );
      setStep('compress');
      const compressionOutput = await exportPipeline.launchCompression(
        exportPipelineContext,
        resourcesDownloadOutput
      );
      const { launchUpload, launchOnlineBuild } = exportPipeline;
      if (!!launchUpload && !!launchOnlineBuild) {
        setStep('upload');
        const uploadBucketKey = await launchUpload(
          exportPipelineContext,
          compressionOutput
        );
        setStep('waiting-for-build');
        const build = await launchOnlineBuild(
          this.state.exportState,
          authenticatedUser,
          uploadBucketKey,
          project.getProjectUuid(),
          {
            gameName: project.getName(),
            gameVersion: project.getVersion(),
          },
          !!payWithCredits
        );
        setStep('build');
        // Refresh limits as either the quota or the credits may have changed.
        // No need to await for this call, as this is just to refresh the UI.
        this.props.authenticatedUser.onRefreshLimits();
        this.setState({ build }, () => {
          this._startBuildWatch(authenticatedUser);
        });

        // When the build is started, update the game because the build may be linked to it.
        this.props.gameAndBuildsManager.refreshGame();
        // Also refresh the builds list, as the new build will be considered as a pending build.
        this.props.gameAndBuildsManager.refreshBuilds();
      }
      setStep('done');
      this.setState({
        compressionOutput,
        doneFooterOpen: true,
        gameLink: resourcesDownloadOutput?.gameLink?? "",
      });
      if (this.props.onExportSucceeded)
        this.props.onExportSucceeded({ build: this.state.build });
    } catch (error) {
      console.error('An error happened during export:', error);
      if (!this.state.errored) {
        this.setState({
          errored: true,
        });
        showErrorBox({
          message:
            getErrorMessage(i18n, this.state.exportStep) +
            (error.message ? `\n\n${error.message}` : ''),
          rawError: {
            exportStep: this.state.exportStep,
            rawError: error,
          },
          errorId: 'export-error',
        });
      }
      if (this.props.onExportErrored) this.props.onExportErrored();
    }
  };

  _updateExportState = (updater: any => any) => {
    this.setState(prevState => ({
      ...prevState,
      exportState: updater(prevState.exportState),
    }));
  };

  render() {
    const {
      exportStep,
      compressionOutput,
      gameLink,
      build,
      stepMaxProgress,
      stepCurrentProgress,
      errored,
      doneFooterOpen,
      exportState,
    } = this.state;
    const {
      i18n,
      project,
      authenticatedUser,
      exportPipeline,
      onSaveProject,
      isSavingProject,
      gameAndBuildsManager,
      uiMode,
    } = this.props;
    if (!project) return null;
    const buildQuota = getBuildQuota(
      authenticatedUser,
      exportPipeline.onlineBuildType
    );
    const buildCreditPrice = getBuildCreditPrice(
      authenticatedUser,
      exportPipeline.onlineBuildType
    );

    const hasBuildsCurrentlyRunning = () => {
      if (!gameAndBuildsManager.builds) return false;

      // We check pending builds that are not more than 10 minutes old,
      // to avoid counting builds that may be stuck.
      return !!gameAndBuildsManager.builds.filter(
        build =>
          build.status === 'pending' &&
          build.type === exportPipeline.onlineBuildType &&
          build.createdAt &&
          build.createdAt > Date.now() - 10 * 60 * 1000
      ).length;
    };

    const canLaunchBuild = (authenticatedUser: AuthenticatedUser) => {
      if (buildQuota) {
        const buildsRemaining = buildQuota
          ? Math.max(buildQuota.max - buildQuota.current, 0)
          : 0;
        if (!buildsRemaining) return false;
      }

      return exportPipeline.canLaunchBuild(exportState, errored, exportStep);
    };

    const isExporting = !!exportStep && exportStep !== 'done';
    const isBuildRunning = !!build && build.status === 'pending';
    const isExportingOrWaitingForBuild = isExporting || isBuildRunning;
    const isExportAndBuildCompleteOrErrored =
      (exportStep === 'done' && !isBuildRunning) || errored;
    const isUsingOnlineBuildNonAuthenticated =
      !!exportPipeline.onlineBuildType && !authenticatedUser.authenticated;
    const isOnlineBuildIncludedInSubscription =
      !!buildQuota && buildQuota.max > 0;
    const hasSomeBuildsRunning = hasBuildsCurrentlyRunning();

    return (
      <Column noMargin expand justifyContent="center">
        {!isUsingOnlineBuildNonAuthenticated && (
          <Column noMargin>
            {!!exportPipeline.onlineBuildType &&
              gameAndBuildsManager.gameAvailabilityError &&
              gameAndBuildsManager.gameAvailabilityError === 'not-owned' && (
                <AlertMessage kind="warning">
                  <Trans>
                    The project currently opened is registered online but you
                    don't have access to it. A link or file will be created but
                    the game will not be registered.
                  </Trans>
                </AlertMessage>
              )}
            {!!exportPipeline.packageNameWarningType &&
              project.getPackageName().indexOf('com.example') !== -1 && (
                <Line>
                  <DismissableAlertMessage
                    identifier="project-should-have-unique-package-name"
                    kind="warning"
                  >
                    {i18n._(
                      exportPipeline.packageNameWarningType === 'mobile'
                        ? t`The package name begins with com.example, make sure you
                    replace it with an unique one to be able to publish your
                    game on app stores.`
                        : t`The package name begins with
                    com.example, make sure you replace it with an unique one,
                    else installing your game might overwrite other games.`
                    )}
                  </DismissableAlertMessage>
                </Line>
              )}
            {exportPipeline.renderTutorial && exportPipeline.renderTutorial()}
          </Column>
        )}
        <Column expand justifyContent="center">
          {!isUsingOnlineBuildNonAuthenticated && (
            <Line alignItems="center" justifyContent="center">
              {exportPipeline.renderHeader({
                project,
                authenticatedUser,
                exportState,
                updateExportState: this._updateExportState,
                isExporting: isExportingOrWaitingForBuild,
                exportStep,
                build,
                quota: buildQuota,
                uiMode: uiMode || 'full',
              })}
            </Line>
          )}
          {!isUsingOnlineBuildNonAuthenticated &&
            isOnlineBuildIncludedInSubscription &&
            exportPipeline.shouldSuggestBumpingVersionNumber &&
            exportPipeline.shouldSuggestBumpingVersionNumber() &&
            !isExportAndBuildCompleteOrErrored && (
              <Line noMargin>
                <Toggle
                  labelPosition="right"
                  toggled={this.state.shouldBumpVersionNumber}
                  label={
                    <Trans>
                      Increase version number to{' '}
                      {this._candidateBumpedVersionNumber}
                    </Trans>
                  }
                  onToggle={(e, toggled) => {
                    this.setState({
                      shouldBumpVersionNumber: toggled,
                    });
                  }}
                  disabled={isExportingOrWaitingForBuild}
                />
              </Line>
            )}
          {!!exportPipeline.limitedBuilds &&
            authenticatedUser.authenticated &&
            !isExportAndBuildCompleteOrErrored && (
              <Line>
                <Column noMargin expand>
                  <CurrentUsageDisplayer
                    subscription={authenticatedUser.subscription}
                    quota={buildQuota}
                    usagePrice={buildCreditPrice}
                    onChangeSubscription={this.props.onChangeSubscription}
                    onStartBuildWithCredits={() => {
                      this._launchWholeExport({
                        payWithCredits: true,
                      });
                    }}
                    hidePurchaseWithCredits={isExportingOrWaitingForBuild}
                  />
                </Column>
              </Line>
            )}
          {!!exportPipeline.limitedBuilds &&
            authenticatedUser.authenticated &&
            !build &&
            hasSomeBuildsRunning && (
              <AlertMessage kind="info">
                <Trans>
                  You have a build currently running, you can see its progress
                  via the exports button at the bottom of this dialog.
                </Trans>
              </AlertMessage>
            )}
          {isUsingOnlineBuildNonAuthenticated && (
            <CreateProfile
              onOpenLoginDialog={authenticatedUser.onOpenLoginDialog}
              onOpenCreateAccountDialog={
                authenticatedUser.onOpenCreateAccountDialog
              }
              message={
                <Trans>
                  Create an account or login first to export your game using
                  online services.
                </Trans>
              }
              justifyContent="center"
            />
          )}
          {!isUsingOnlineBuildNonAuthenticated &&
            exportPipeline.renderExportFlow({
              project,
              gameAndBuildsManager,
              disabled: !canLaunchBuild(authenticatedUser),
              launchExport: async () =>
                this.launchWholeExport({ payWithCredits: false }),
              build,
              errored,
              exportStep,
              isSavingProject,
              onSaveProject,
              isExporting,
              stepCurrentProgress,
              stepMaxProgress,
              uiMode: uiMode || 'full',
            })}
          {doneFooterOpen &&
            exportPipeline.renderDoneFooter &&
            exportPipeline.renderDoneFooter({
              compressionOutput,
              exportState,
              gameLink: gameLink,
            })}
        </Column>
      </Column>
    );
  }
}
