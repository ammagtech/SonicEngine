// @flow
import { type Exporter } from '../ShareDialog';
import { browserOnlineCordovaExportPipeline } from './BrowserOnlineCordovaExport';
import { browserOnlineCordovaIosExportPipeline } from './BrowserOnlineCordovaIosExport';
import { browserOnlineElectronExportPipeline } from './BrowserOnlineElectronExport';
import { browserOnlineWebExportPipeline } from './BrowserOnlineWebExport';
import { browserHTML5ExportPipeline } from './BrowserHTML5Export';
import { browserHTML5TelegramExportPipeline } from './BrowserHTML5TelegramExport';
import { browserHTML5PublishExportPipeline } from './BrowserHTML5PublishExport';
import { browserCordovaExportPipeline } from './BrowserCordovaExport';
import { browserElectronExportPipeline } from './BrowserElectronExport';
import { browserFacebookInstantGamesExportPipeline } from './BrowserFacebookInstantGamesExport';
import { cordovaExporter } from '../GenericExporters/CordovaExport';
import { onlineWebExporter } from '../GenericExporters/OnlineWebExport';
import { html5Exporter } from '../GenericExporters/HTML5Export';
import { html5Exporter as telegramExporter } from '../GenericExporters/TelegramExport';
import { html5Exporter as PublishExport } from '../GenericExporters/PublishExport';
import { facebookInstantGamesExporter } from '../GenericExporters/FacebookInstantGamesExport';
import { onlineCordovaExporter } from '../GenericExporters/OnlineCordovaExport';
import { onlineCordovaIosExporter } from '../GenericExporters/OnlineCordovaIosExport';
import { onlineElectronExporter } from '../GenericExporters/OnlineElectronExport';
import { electronExporter } from '../GenericExporters/ElectronExport';

export const browserOnlineWebExporter: Exporter = {
  ...onlineWebExporter,
  exportPipeline: browserOnlineWebExportPipeline,
};

export const browserAutomatedExporters: Array<Exporter> = [
  {
    ...html5Exporter,
    exportPipeline: browserHTML5ExportPipeline,
  },
  {
    ...PublishExport,
    exportPipeline: browserHTML5PublishExportPipeline,
  },
  {
    ...onlineCordovaExporter,
    exportPipeline: browserOnlineCordovaExportPipeline,
  },
  {
    ...onlineCordovaIosExporter,
    exportPipeline: browserOnlineCordovaIosExportPipeline,
  },
  {
    ...onlineElectronExporter,
    exportPipeline: browserOnlineElectronExportPipeline,
  },
  {
    ...facebookInstantGamesExporter,
    exportPipeline: browserFacebookInstantGamesExportPipeline,
  },
];

export const browserManualExporters: Array<Exporter> = [
  {
    ...html5Exporter,
    exportPipeline: browserHTML5ExportPipeline,
  },
  {
    ...telegramExporter,
    exportPipeline: browserHTML5TelegramExportPipeline,
  },
  {
    ...cordovaExporter,
    exportPipeline: browserCordovaExportPipeline,
  },
  {
    ...electronExporter,
    exportPipeline: browserElectronExportPipeline,
  },
];
