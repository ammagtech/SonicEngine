// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type ElectronUpdateStatus } from './UpdaterTools';
import { type FileMetadataAndStorageProviderName } from '../ProjectsStorage';
import { type ShortcutMap } from '../KeyboardShortcuts/DefaultShortcuts';
import {
  type MenuDeclarativeItemTemplate,
  type MenuItemTemplate,
} from '../UI/Menu/Menu.flow';
import { getElectronAccelerator } from '../KeyboardShortcuts';
import { isMacLike } from '../Utils/Platform';
import Window from '../Utils/Window';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');

const isDesktop = !!electron;

export type BuildMainMenuProps = {|
  i18n: I18nType,
  project: ?gdProject,
  canSaveProjectAs: boolean,
  recentProjectFiles: Array<FileMetadataAndStorageProviderName>,
  shortcutMap: ShortcutMap,
  isApplicationTopLevelMenu: boolean,
|};

export type MainMenuCallbacks = {|
  onChooseProject: () => void,
  onOpenRecentFile: (
    fileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName
  ) => Promise<void>,
  onSaveProject: () => Promise<void>,
  onSaveProjectAs: () => void,
  onShowVersionHistory: () => void,
  onCloseProject: () => Promise<boolean>,
  onCloseApp: () => void,
  onExportProject: () => void,
  onInviteCollaborators: () => void,
  onCreateProject: () => void,
  onOpenProjectManager: (open?: boolean) => void,
  onOpenHomePage: () => void,
  onOpenDebugger: () => void,
  onOpenAbout: (open?: boolean) => void,
  onOpenPreferences: (open?: boolean) => void,
  onOpenLanguage: (open?: boolean) => void,
  onOpenProfile: (open?: boolean) => void,
  setElectronUpdateStatus: ElectronUpdateStatus => void,
|};

export type MainMenuExtraCallbacks = {|
  onClosePreview?: ?(windowId: number) => void,
|};

export type MainMenuEvent =
  | 'main-menu-open'
  | 'main-menu-open-recent'
  | 'main-menu-save'
  | 'main-menu-save-as'
  | 'main-menu-show-version-history'
  | 'main-menu-close'
  | 'main-menu-close-app'
  | 'main-menu-export'
  | 'main-menu-invite-collaborators'
  | 'main-menu-create-project'
  | 'main-menu-create-blank'
  | 'main-menu-open-project-manager'
  | 'main-menu-open-home-page'
  | 'main-menu-open-debugger'
  | 'main-menu-open-about'
  | 'main-menu-open-preferences'
  | 'main-menu-open-language'
  | 'main-menu-open-profile'
  | 'update-status';

const getMainMenuEventCallback = (
  mainMenuEvent: string,
  callbacks: MainMenuCallbacks
): Function => {
  const mapping = {
    'main-menu-open': callbacks.onChooseProject,
    'main-menu-open-recent': callbacks.onOpenRecentFile,
    'main-menu-save': callbacks.onSaveProject,
    'main-menu-save-as': callbacks.onSaveProjectAs,
    'main-menu-show-version-history': callbacks.onShowVersionHistory,
    'main-menu-close': callbacks.onCloseProject,
    'main-menu-close-app': callbacks.onCloseApp,
    'main-menu-export': callbacks.onExportProject,
    'main-menu-invite-collaborators': callbacks.onInviteCollaborators,
    'main-menu-create-project': callbacks.onCreateProject,
    'main-menu-open-project-manager': callbacks.onOpenProjectManager,
    'main-menu-open-home-page': callbacks.onOpenHomePage,
    'main-menu-open-debugger': callbacks.onOpenDebugger,
    'main-menu-open-about': callbacks.onOpenAbout,
    'main-menu-open-preferences': callbacks.onOpenPreferences,
    'main-menu-open-language': callbacks.onOpenLanguage,
    'main-menu-open-profile': callbacks.onOpenProfile,
    'update-status': callbacks.setElectronUpdateStatus,
  };

  return mapping[mainMenuEvent] || (() => {});
};

export const buildMainMenuDeclarativeTemplate = ({
  shortcutMap,
  i18n,
  recentProjectFiles,
  project,
  canSaveProjectAs,
  isApplicationTopLevelMenu,
}: BuildMainMenuProps): Array<MenuDeclarativeItemTemplate> => {
  const fileTemplate: MenuDeclarativeItemTemplate = {
    label: i18n._(t`File`),
    submenu: [
      {
        label: i18n._(t`Create a game`),
        accelerator: getElectronAccelerator(shortcutMap['CREATE_NEW_PROJECT']),
        onClickSendEvent: 'main-menu-create-project',
      },
      { type: 'separator' },
      {
        label: i18n._(t`Open...`),
        accelerator: getElectronAccelerator(shortcutMap['OPEN_PROJECT']),
        onClickSendEvent: 'main-menu-open',
      },
      {
        label: i18n._(t`Open Recent`),
        submenu:
          recentProjectFiles.length > 0
            ? recentProjectFiles.map(item => ({
                label: item.fileMetadata.fileIdentifier,
                onClickSendEvent: 'main-menu-open-recent',
                eventArgs: item,
              }))
            : [
                {
                  label: i18n._(t`No recent project`),
                  enabled: false,
                },
              ],
      },
      { type: 'separator' },
      {
        label: i18n._(t`Save`),
        accelerator: getElectronAccelerator(shortcutMap['SAVE_PROJECT']),
        onClickSendEvent: 'main-menu-save',
        enabled: !!project,
      },
      {
        label: i18n._(t`Save as...`),
        accelerator: getElectronAccelerator(shortcutMap['SAVE_PROJECT_AS']),
        onClickSendEvent: 'main-menu-save-as',
        enabled: canSaveProjectAs,
      },
      {
        label: i18n._(t`Show version history`),
        onClickSendEvent: 'main-menu-show-version-history',
        enabled: !!project,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Invite collaborators`),
        accelerator: getElectronAccelerator(
          shortcutMap['INVITE_COLLABORATORS']
        ),
        onClickSendEvent: 'main-menu-invite-collaborators',
        enabled: !!project,
      },
      {
        label: i18n._(t`Export (web, iOS, Android)...`),
        accelerator: getElectronAccelerator(shortcutMap['EXPORT_GAME']),
        onClickSendEvent: 'main-menu-export',
        enabled: !!project,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Close Project`),
        accelerator: getElectronAccelerator(shortcutMap['CLOSE_PROJECT']),
        onClickSendEvent: 'main-menu-close',
        enabled: !!project,
      },
    ],
  };

  // The window is only useful on the desktop app. It will be skipped on the web-app.
  const editTemplate: MenuDeclarativeItemTemplate = {
    label: i18n._(t`Edit`),
    submenu: [
      { label: i18n._(t`Undo`), role: 'undo' },
      { label: i18n._(t`Redo`), role: 'redo' },
      { type: 'separator' },
      { label: i18n._(t`Cut`), role: 'cut' },
      { label: i18n._(t`Copy`), role: 'copy' },
      { label: i18n._(t`Paste`), role: 'paste' },
      { label: i18n._(t`Paste and Match Style`), role: 'pasteandmatchstyle' },
      { label: i18n._(t`Delete`), role: 'delete' },
      { label: i18n._(t`Select All`), role: 'selectall' },
    ],
  };

  const viewTemplate: MenuDeclarativeItemTemplate = {
    label: i18n._(t`View`),
    submenu: [
      {
        label: i18n._(t`Show Project Manager`),
        accelerator: getElectronAccelerator(
          shortcutMap['OPEN_PROJECT_MANAGER']
        ),
        onClickSendEvent: 'main-menu-open-project-manager',
        enabled: !!project,
      },
      {
        label: i18n._(t`Show Home`),
        onClickSendEvent: 'main-menu-open-home-page',
      },
      {
        label: i18n._(t`Open Debugger`),
        onClickSendEvent: 'main-menu-open-debugger',
        enabled: !!project,
      },
      // Some Electron specific menu items, not shown in the web-app.
      ...(!!electron
        ? [
            { type: 'separator' },
            {
              label: i18n._(t`Toggle Developer Tools`),
              role: 'toggledevtools',
            },
            { type: 'separator' },
            { label: i18n._(t`Toggle Fullscreen`), role: 'togglefullscreen' },
          ]
        : []),
    ],
  };

  // The window is only useful on the desktop app. It will be skipped on the web-app.
  const windowTemplate: MenuDeclarativeItemTemplate = {
    label: i18n._(t`Window`),
    role: 'window',
    submenu: [{ label: i18n._(t`Minimize`), role: 'minimize' }],
  };

  // The help menu is mostly a collection of links.
  const helpTemplate: MenuDeclarativeItemTemplate = {
    label: i18n._(t`Help`),
    role: 'help',
    submenu: [
      {
        label: i18n._(t`Sonic Engine website`),
        onClickOpenLink: 'https://sonicengine.net/',
      },
      { type: 'separator' },

      ...(isMacLike() && isDesktop
        ? []
        : [
            { type: 'separator' },
            {
              label: i18n._(t`About Sonic Engine`),
              onClickSendEvent: 'main-menu-open-about',
            },
          ]),
    ],
  };

  // Structure of the menu. Some electron specific menus are not even shown
  // on the web-app, because they would not work and make sense at all.
  const template: Array<MenuDeclarativeItemTemplate> = [
    fileTemplate,
    ...(!!electron && isApplicationTopLevelMenu ? [editTemplate] : []),
    ...(!!electron && isApplicationTopLevelMenu ? [viewTemplate] : []),
    ...(!!electron && isApplicationTopLevelMenu ? [windowTemplate] : []),
    helpTemplate,
  ];

  // macOS has a menu with the name of the app.
  if (isMacLike() && isApplicationTopLevelMenu) {
    template.unshift({
      label: i18n._(t`GDevelop 5`),
      submenu: [
        {
          label: i18n._(t`About GDevelop`),
          onClickSendEvent: 'main-menu-open-about',
        },
        { type: 'separator' },
        {
          label: i18n._(t`My Profile`),
          onClickSendEvent: 'main-menu-open-profile',
        },
        {
          label: i18n._(t`Preferences`),
          onClickSendEvent: 'main-menu-open-preferences',
        },
        {
          label: i18n._(t`Language`),
          onClickSendEvent: 'main-menu-open-language',
        },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    // $FlowFixMe - submenu is guaranteed to exist.
    editTemplate.submenu.push(
      { type: 'separator' },
      {
        label: i18n._(t`Speech`),
        submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
      }
    );

    // $FlowFixMe - submenu is guaranteed to exist.
    windowTemplate.submenu = [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  return template;
};

export const adaptFromDeclarativeTemplate = (
  menuDeclarativeTemplate: Array<MenuDeclarativeItemTemplate>,
  callbacks: MainMenuCallbacks
): Array<MenuItemTemplate> => {
  const adaptMenuDeclarativeItemTemplate = (
    menuTemplate: Array<MenuDeclarativeItemTemplate>
  ): Array<MenuItemTemplate> =>
    menuTemplate.map((menuItemTemplate: MenuDeclarativeItemTemplate) => {
      const {
        // $FlowFixMe - property can be undefined.
        onClickSendEvent,
        // $FlowFixMe - property can be undefined.
        onClickOpenLink,
        // $FlowFixMe - property can be undefined.
        eventArgs,
        ...menuItemTemplateRest
      } = menuItemTemplate;

      const hasOnClick = onClickSendEvent || onClickOpenLink;

      // $FlowFixMe - we're putting both a click and a submenu, so not strictly following the schema.
      return {
        ...menuItemTemplateRest,
        click: hasOnClick
          ? function() {
              if (menuItemTemplate.onClickSendEvent) {
                const mainMenuEvent = menuItemTemplate.onClickSendEvent;
                const callback = getMainMenuEventCallback(
                  mainMenuEvent,
                  callbacks
                );

                if (eventArgs) callback(eventArgs);
                else callback();
              }

              if (menuItemTemplate.onClickOpenLink) {
                Window.openExternalURL(menuItemTemplate.onClickOpenLink);
              }
            }
          : undefined,
        submenu: menuItemTemplate.submenu
          ? adaptMenuDeclarativeItemTemplate(menuItemTemplate.submenu)
          : undefined,
      };
    });

  return adaptMenuDeclarativeItemTemplate(menuDeclarativeTemplate);
};
