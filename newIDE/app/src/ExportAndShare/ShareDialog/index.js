// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';
import FlatButton from '../../UI/FlatButton';
import BuildsDialog from '../Builds/BuildsDialog';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import PublishHome from './PublishHome';
import { type ExportPipeline } from '../ExportPipeline.flow';
import { Tabs } from '../../UI/Tabs';
import InviteHome from './InviteHome';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import TextButton from '../../UI/TextButton';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { type FileMetadata, type StorageProvider } from '../../ProjectsStorage';
import { useOnlineStatus } from '../../Utils/OnlineStatus';
import ErrorBoundary from '../../UI/ErrorBoundary';
import type { GamesList } from '../../GameDashboard/UseGamesList';
import { useGameAndBuildsManager } from '../../Utils/UseGameAndBuildsManager';

export type ShareTab = 'invite' | 'publish';
export type ExporterSection = 'browser' | 'desktop' | 'android' | 'ios' | 'telegram' | 'cloud';
export type ExporterSubSection = 'online' | 'offline' | 'facebook' | 'telegram' | 'publish';
export type ExporterKey =
  | 'onlinewebexport'
  | 'onlineelectronexport'
  | 'onlinecordovaexport'
  | 'onlinecordovaiosexport'
  | 'webexport'
  | 'publishgame'
  | 'telegramexport'
  | 'facebookinstantgamesexport'
  | 'electronexport'
  | 'cordovaexport';

const exporterSectionMapping: {
  [key: ExporterSection]: { [key: ExporterSubSection]: ?ExporterKey },
} = {
  browser: {
    online: 'onlinewebexport',
    offline: 'webexport',
    facebook: 'facebookinstantgamesexport',
  },
  cloud:{
    publish: 'publishgame',
  },
  telegram: {
    telegram: 'telegramexport',
  },
  desktop: {
    online: 'onlineelectronexport',
    offline: 'electronexport',
    facebook: null,
  },
  android: {
    online: 'onlinecordovaexport',
    offline: 'cordovaexport',
    facebook: null,
  },
  ios: {
    online: 'onlinecordovaiosexport',
    offline: 'cordovaexport',
    facebook: null,
  },
};

export type Exporter = {|
  name: React.Node,
  tabName: React.Node,
  helpPage: string,
  disabled?: boolean,
  key: ExporterKey,
  exportPipeline: ExportPipeline<any, any, any, any, any>,
|};

export type ShareDialogWithoutExportsProps = {|
  project: ?gdProject,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  onClose: () => void,
  onChangeSubscription: () => void,
  initialTab: ?ShareTab,
  fileMetadata: ?FileMetadata,
  storageProvider: StorageProvider,
  gamesList: GamesList,
|};

type Props = {|
  ...ShareDialogWithoutExportsProps,
  /**
   * Use `null` to hide automated exporters.
   * It should be used with manualExporters set to `null` as well.
   */
  automatedExporters: ?Array<Exporter>,
  /**
   * Use `null` to hide manual exporters.
   * It should be used with automatedExporters set to `null` as well.
   */
  manualExporters: ?Array<Exporter>,
  // GDevelop's game platform exporter.
  onlineWebExporter: Exporter,
  /**
   * If true, all exporters will be disabled if the user is offline.
   * This is mainly helpful on browser, where we need to download resources
   * before exporting.
   */
  allExportersRequireOnline?: boolean,
|};

const ShareDialog = ({
  project,
  onSaveProject,
  isSavingProject,
  onClose,
  allExportersRequireOnline,
  onChangeSubscription,
  automatedExporters,
  manualExporters,
  onlineWebExporter,
  initialTab,
  fileMetadata,
  storageProvider,
  gamesList,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const {
    setShareDialogDefaultTab,
    getShareDialogDefaultTab,
  } = React.useContext(PreferencesContext);
  const [currentTab, setCurrentTab] = React.useState<ShareTab>(
    initialTab || getShareDialogDefaultTab()
  );
  const showOnlineWebExporterOnly = !automatedExporters && !manualExporters;
  const [
    chosenExporterSection,
    setChosenExporterSection,
  ] = React.useState<?ExporterSection>(
    showOnlineWebExporterOnly ? 'browser' : null
  );
  const [
    chosenExporterSubSection,
    setChosenExporterSubSection,
  ] = React.useState<?ExporterSubSection>(
    showOnlineWebExporterOnly ? 'online' : null
  );

  React.useEffect(() => setShareDialogDefaultTab(currentTab), [
    setShareDialogDefaultTab,
    currentTab,
  ]);
  const isOnline = useOnlineStatus();

  const [buildsDialogOpen, setBuildsDialogOpen] = React.useState<boolean>(
    false
  );
  const [
    isNavigationDisabled,
    setIsNavigationDisabled,
  ] = React.useState<boolean>(false);

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();

  const gameAndBuildsManager = useGameAndBuildsManager({
    project,
    onGameRegistered: gamesList.fetchGames,
  });

  const openBuildDialog = () => {
    if (!gameAndBuildsManager.game) {
      const title = t`Cannot see the exports`;
      const message =
        gameAndBuildsManager.gameAvailabilityError === 'not-found'
          ? t`Register or publish your game first to see its exports.`
          : gameAndBuildsManager.gameAvailabilityError === 'not-owned'
          ? t`You are not the owner of this game, ask the owner to add you as an owner to see its exports.`
          : t`Either this game is not registered or you are not its owner, so you cannot see its builds.`;

      showAlert({
        title,
        message,
      });
      return;
    }
    setBuildsDialogOpen(true);
  };

  const exporters = React.useMemo(
    () => [
      ...(automatedExporters || []),
      ...(manualExporters || []),
      onlineWebExporter,
    ],
    [automatedExporters, manualExporters, onlineWebExporter]
  );

  const exporter: ?Exporter = React.useMemo(
    () => {
      if (!chosenExporterSection) return null;
      if (!chosenExporterSubSection) return null;

      const exporterKey =
        exporterSectionMapping[chosenExporterSection][chosenExporterSubSection];
      const chosenExporter = exporters.find(
        exporter => exporter.key === exporterKey
      );

      return chosenExporter || null;
    },
    [chosenExporterSection, chosenExporterSubSection, exporters]
  );

  if (!project) return null;

  const mainActions = [
    <FlatButton
      label={<Trans>Close</Trans>}
      key="close"
      primary={false}
      onClick={onClose}
      disabled={isNavigationDisabled}
    />,
  ];

  const secondaryActions =
    currentTab === 'publish'
      ? [
          exporter ? (
            <HelpButton key="help" helpPagePath={exporter.helpPage} />
          ) : null,
          <TextButton
            key="exports"
            label={
              isMobile ? <Trans>Exports</Trans> : <Trans>See all exports</Trans>
            }
            onClick={openBuildDialog}
            disabled={isNavigationDisabled || !isOnline}
          />,
        ].filter(Boolean)
      : [
          <HelpButton
            key="help"
            helpPagePath="/collaboration/invite-collaborators"
          />,
        ];

  return (
    <Dialog
      // Keep ID for backward compatibility with guided lessons.
      id="export-dialog"
      maxWidth={'md'}
      minHeight={'lg'}
      title={<Trans>Share</Trans>}
      actions={mainActions}
      secondaryActions={secondaryActions}
      onRequestClose={onClose}
      open
      fixedContent={
        <Tabs
          value={currentTab}
          onChange={setCurrentTab}
          options={[
            {
              value: 'publish',
              label: <Trans>Publish</Trans>,
              id: 'publish-tab',
              disabled: isNavigationDisabled,
            },
            // {
            //   value: 'invite',
            //   label: <Trans>Invite</Trans>,
            //   id: 'invite-tab',
            //   disabled: isNavigationDisabled,
            // },
          ]}
        />
      }
      flexColumnBody
    >
      {currentTab === 'invite' && (
        <InviteHome
          cloudProjectId={
            storageProvider.internalName === 'Cloud' && fileMetadata
              ? fileMetadata.fileIdentifier
              : null
          }
        />
      )}
      {currentTab === 'publish' && (
        <PublishHome
          project={project}
          gameAndBuildsManager={gameAndBuildsManager}
          onSaveProject={onSaveProject}
          isSavingProject={isSavingProject}
          onChangeSubscription={onChangeSubscription}
          isNavigationDisabled={isNavigationDisabled}
          setIsNavigationDisabled={setIsNavigationDisabled}
          selectedExporter={exporter}
          onChooseSection={setChosenExporterSection}
          onChooseSubSection={setChosenExporterSubSection}
          chosenSection={chosenExporterSection}
          chosenSubSection={chosenExporterSubSection}
          allExportersRequireOnline={allExportersRequireOnline}
          showOnlineWebExporterOnly={showOnlineWebExporterOnly}
        />
      )}
      {gameAndBuildsManager.game && (
        <BuildsDialog
          open={buildsDialogOpen}
          onClose={() => setBuildsDialogOpen(false)}
          authenticatedUser={authenticatedUser}
          game={gameAndBuildsManager.game}
          onGameUpdated={gameAndBuildsManager.setGame}
        />
      )}
    </Dialog>
  );
};

const ShareDialogWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Share dialog</Trans>}
    scope="export-and-share"
    onClose={props.onClose}
  >
    <ShareDialog {...props} />
  </ErrorBoundary>
);

export default ShareDialogWithErrorBoundary;
