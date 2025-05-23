// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Line } from '../UI/Grid';
import Text from '../UI/Text';
import LinearProgress from '../UI/LinearProgress';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
import { ColumnStackLayout } from '../UI/Layout';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../Profile/AuthenticatedUserContext';
import { duplicateLeaderboard } from '../Utils/GDevelopServices/Play';
import { registerGame } from '../Utils/GDevelopServices/Game';
import { toNewGdMapStringString } from '../Utils/MapStringString';
import { getDefaultRegisterGameProperties } from '../Utils/UseGameAndBuildsManager';

const gd: libGDevelop = global.gd;

type ReplacePromptDialogProps = {|
  leaderboardsToReplace: ?Array<string>,
  onClose: () => void,
  onTriggerReplace: () => void,
|};

export const ReplacePromptDialog = ({
  leaderboardsToReplace,
  onClose,
  onTriggerReplace,
}: ReplacePromptDialogProps) => {
  const { authenticated, onOpenLoginDialog } = React.useContext(
    AuthenticatedUserContext
  );

  return (
    <Dialog
      title={<Trans>Set up new leaderboards for this game</Trans>}
      actions={
        authenticated
          ? [
              <FlatButton
                primary
                key="register-close"
                label={<Trans>Close</Trans>}
                onClick={onClose}
              />,
              <DialogPrimaryButton
                primary
                key="register-game-now"
                label={<Trans>Create new leaderboards now</Trans>}
                onClick={onTriggerReplace}
                id="create-and-replace-new-leaderboard"
              />,
            ]
          : [
              <FlatButton
                primary
                key="login-close"
                label={<Trans>Close</Trans>}
                onClick={onClose}
              />,
              // <DialogPrimaryButton
              //   label={<Trans>Login now</Trans>}
              //   primary
              //   onClick={() => onOpenLoginDialog()}
              //   key="login-now"
              //   id="login-now"
              // />,
            ]
      }
      open
      maxWidth="sm"
      onRequestClose={onClose}
    >
      <Line noMargin>
        <ColumnStackLayout noMargin>
          <Text>
            <Trans>
              This game is using leaderboards. We will create new
              leaderboards for this game in your account, so that the game is
              ready to be played and players can send their scores.
            </Trans>
          </Text>
          <Text>
            <Trans>
              If you skip this step, you can still do it manually later from the
              leaderboards panel in your Games Dashboard.
            </Trans>
          </Text>
        </ColumnStackLayout>
      </Line>
    </Dialog>
  );
};

type LeaderboardReplacerProgressDialogProps = {|
  erroredLeaderboards: Array<{ leaderboardId: string, error: Error }>,
  onRetry: ?() => void,
  onAbandon: ?() => void,
  progress: number,
|};

export const LeaderboardReplacerProgressDialog = ({
  erroredLeaderboards,
  onRetry,
  onAbandon,
  progress,
}: LeaderboardReplacerProgressDialogProps) => {
  const hasErrors = erroredLeaderboards.length > 0;

  return (
    <Dialog
      title={null} // Specific loading dialog where we don't want a title.
      actions={[
        onRetry ? (
          <DialogPrimaryButton
            label={<Trans>Retry</Trans>}
            primary
            onClick={onRetry}
            key="retry"
          />
        ) : null,
        <FlatButton
          label={
            onAbandon ? <Trans>Abandon</Trans> : <Trans>Please wait...</Trans>
          }
          disabled={!onAbandon}
          onClick={onAbandon}
          key="close"
        />,
      ]}
      cannotBeDismissed={!hasErrors}
      open
      maxWidth="sm"
    >
      <Line noMargin>
        <ColumnStackLayout expand>
          <Text>
            {hasErrors && progress === 100 ? (
              <Trans>
                There were errors when preparing new leaderboards for the
                project.
              </Trans>
            ) : (
              <Trans>Preparing the leaderboard for your game...</Trans>
            )}
          </Text>
          <Line noMargin expand>
            <LinearProgress variant="determinate" value={progress} />
          </Line>
          {hasErrors && progress === 100 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Leaderboard ID</TableHeaderColumn>
                  <TableHeaderColumn>Error</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody>
                {erroredLeaderboards.map(({ leaderboardId, error }) => (
                  <TableRow key={leaderboardId}>
                    <TableRowColumn>{leaderboardId}</TableRowColumn>
                    <TableRowColumn>{error.toString()}</TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </ColumnStackLayout>
      </Line>
    </Dialog>
  );
};

type RetryOrAbandonCallback = () => void;

type UseLeaderboardReplacerOutput = {|
  openLeaderboardReplacerDialogIfNeeded: (
    project: gdProject,
    sourceGameId: string
  ) => void,

  /**
   * Render, if needed, the dialog that will show the progress of leaderboard replacement.
   */
  renderLeaderboardReplacerDialog: () => React.Node,
|};

type ErroredLeaderboard = {
  leaderboardId: string,
  error: Error,
};

/**
 * Launch the replacement of leaderboards, if needed.
 * First, register game, then copy leaderboards in database, and finally
 * replace them in events.
 */
export const replaceLeaderboardsInProject = async ({
  authenticatedUser,
  project,
  sourceGameId,
  leaderboardsToReplace,
  setProgress,
}: {|
  authenticatedUser: AuthenticatedUser,
  project: gdProject,
  sourceGameId: string,
  leaderboardsToReplace: Array<string>,
  setProgress: (percent: number | ((percent: number) => number)) => void,
|}) => {
  const { getAuthorizationHeader, profile } = authenticatedUser;
  if (!leaderboardsToReplace || !project || !sourceGameId) {
    throw new Error('No leaderboards found in events sheet.');
  }
  if (!profile) {
    throw new Error('User is not connected.');
  }

  // Number of leaderboards to replace + game registration + leaderboard replace in events sheet.
  const totalSteps = leaderboardsToReplace.length + 2;
  const progressStep = (1 / totalSteps) * 100;

  const replacedLeaderboardsMap = {};

  setProgress(0);

  // Register game. The error will silently be caught if the game already exists,
  // but user will be able to retry if it doesn't because leaderboards copy will
  // fail.
  try {
    await registerGame(
      getAuthorizationHeader,
      profile.id,
      getDefaultRegisterGameProperties({
        projectId: project.getProjectUuid(),
        projectName: project.getName(),
        projectAuthor: project.getAuthor(),
        // Assume the project is not saved at this stage.
        savedStatus: 'draft',
      })
    );
  } catch (error) {
    console.error(
      'Could not register game before leaderboard replacement: ',
      error
    );
  }
  setProgress(progressStep);

  const duplicateLeaderboardAndStepProgress = async (
    authenticatedUser: AuthenticatedUser,
    leaderboardId: string
  ): Promise<?ErroredLeaderboard> => {
    try {
      const duplicatedLeaderboard = await duplicateLeaderboard(
        authenticatedUser,
        project.getProjectUuid(),
        {
          sourceGameId: sourceGameId,
          sourceLeaderboardId: leaderboardId,
        }
      );
      replacedLeaderboardsMap[leaderboardId] = duplicatedLeaderboard.id;
      setProgress(previousProgress => previousProgress + progressStep);
      return null;
    } catch (error) {
      console.error(`Could not duplicate leaderboard ${leaderboardId}`, error);
      setProgress(previousProgress => previousProgress + progressStep);
      return {
        leaderboardId,
        error: error,
      };
    }
  };

  // Duplicate leaderboards.
  const responseLeaderboardsWithErrors = await Promise.all(
    Array.from(leaderboardsToReplace).map(async leaderboardId =>
      duplicateLeaderboardAndStepProgress(authenticatedUser, leaderboardId)
    )
  );
  const leaderboardsWithErrors = responseLeaderboardsWithErrors.filter(Boolean);

  // Replace leaderboards in events.
  if (Object.keys(replacedLeaderboardsMap).length) {
    const renamedLeaderboardsMap = toNewGdMapStringString(
      replacedLeaderboardsMap
    );
    gd.WholeProjectRefactorer.renameLeaderboards(
      project,
      renamedLeaderboardsMap
    );
    renamedLeaderboardsMap.delete();
  }
  setProgress(100);

  return {
    leaderboardsWithErrors,
  };
};

export const findLeaderboardsToReplaceInProject = ({
  project,
}: {|
  project: gdProject,
|}) => {
  const leaderboardIds = gd.WholeProjectRefactorer.findAllLeaderboardIds(
    project
  )
    .toNewVectorString()
    .toJSArray();
  return leaderboardIds;
};

/**
 * Hook allowing to find and duplicate leaderboards in a project, useful after
 * opening a project from an example.
 */
export const useLeaderboardReplacer = (): UseLeaderboardReplacerOutput => {
  const [project, setProject] = React.useState<gdProject | null>(null);
  const [sourceGameId, setSourceGameId] = React.useState<string | null>(null);
  const [shouldReplace, setShouldReplace] = React.useState(false);
  const [
    leaderboardsToReplace,
    setLeaderboardsToReplace,
  ] = React.useState<?Array<string>>(null);

  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const [erroredLeaderboards, setErroredLeaderboards] = React.useState<
    Array<ErroredLeaderboard>
  >([]);

  const [progress, setProgress] = React.useState(0);
  const [onRetry, setOnRetry] = React.useState<?RetryOrAbandonCallback>(null);
  const [onAbandon, setOnAbandon] = React.useState<?RetryOrAbandonCallback>(
    null
  );

  const ensureLeaderboardsAreReplaced = React.useCallback(
    async () => {
      if (!leaderboardsToReplace || !project || !sourceGameId) {
        return;
      }

      setOnRetry(null);
      setOnAbandon(null);
      setErroredLeaderboards([]);

      const { leaderboardsWithErrors } = await replaceLeaderboardsInProject({
        authenticatedUser,
        project,
        sourceGameId,
        leaderboardsToReplace,
        setProgress,
      });

      setErroredLeaderboards(leaderboardsWithErrors);

      if (leaderboardsWithErrors.length === 0) {
        // No error happened: finish normally, closing the dialog.
        setShouldReplace(false);
        setLeaderboardsToReplace(null);
        return { someLeaderboardsWereDuplicated: true };
      }

      // An error happened. Store the errors and offer a way to
      // retry.
      return new Promise(resolve => {
        setOnRetry(
          (): RetryOrAbandonCallback => () => {
            // Keep only the errored leaderboards.
            setLeaderboardsToReplace(
              leaderboardsToReplace.filter(id =>
                leaderboardsWithErrors.some(
                  erroredLeaderboard => erroredLeaderboard.leaderboardId === id
                )
              )
            );
            // Launch the fetch again, and solve the promise once
            // this new fetch resolve itself.
            resolve(ensureLeaderboardsAreReplaced());
          }
        );
        setOnAbandon(
          (): RetryOrAbandonCallback => () => {
            // Abandon: resolve immediately, closing the dialog
            setErroredLeaderboards([]);
            setShouldReplace(false);
            setLeaderboardsToReplace(null);
            resolve({ someLeaderboardsWereDuplicated: true });
          }
        );
      });
    },
    [
      authenticatedUser,
      project,
      sourceGameId,
      leaderboardsToReplace,
      setProgress,
      setErroredLeaderboards,
      setOnRetry,
      setOnAbandon,
      setShouldReplace,
    ]
  );

  /**
   * Return a set of leaderboard ids found in the project.
   */
  const openLeaderboardReplacerDialogIfNeeded = React.useCallback(
    (project: gdProject, sourceGameId: string) => {
      setProject(project);
      setSourceGameId(sourceGameId);
      setLeaderboardsToReplace(findLeaderboardsToReplaceInProject({ project }));
    },
    []
  );

  const renderLeaderboardReplacerDialog = () => {
    if (!leaderboardsToReplace || !leaderboardsToReplace.length) return null;

    return sourceGameId &&
      project &&
      shouldReplace &&
      authenticatedUser.authenticated ? (
      <LeaderboardReplacerProgressDialog
        erroredLeaderboards={erroredLeaderboards}
        onRetry={onRetry}
        onAbandon={onAbandon}
        progress={progress}
      />
    ) : (
      <ReplacePromptDialog
        leaderboardsToReplace={leaderboardsToReplace}
        onClose={() => setLeaderboardsToReplace(null)}
        onTriggerReplace={() => {
          setShouldReplace(true);
          ensureLeaderboardsAreReplaced();
        }}
      />
    );
  };

  return {
    openLeaderboardReplacerDialogIfNeeded,
    renderLeaderboardReplacerDialog,
  };
};
