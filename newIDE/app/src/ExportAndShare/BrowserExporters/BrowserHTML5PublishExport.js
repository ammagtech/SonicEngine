// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import assignIn from 'lodash/assignIn';
import { findGDJS } from '../../GameEngineFinder/BrowserS3GDJSFinder';
import BrowserFileSystem from './BrowserFileSystem';
import { getPublishGameBucketBaseUrl, getTelegramS3BaseUrl, uploadObjects } from '../../Utils/GDevelopServices/Preview';
import {
  type UrlFileDescriptor,
  type TextFileDescriptor,
  type BlobFileDescriptor,
  downloadUrlFilesToBlobFiles,
  archiveFiles,
} from '../../Utils/BrowserArchiver';
import {
  type ExportFlowProps,
  type ExportPipeline,
  type ExportPipelineContext,
} from '../ExportPipeline.flow';
import RaisedButton from '../../UI/RaisedButton';
import {
  BlobDownloadUrlHolder,
  openBlobDownloadUrl,
} from '../../Utils/BlobDownloadUrlHolder';
import {
  ExplanationHeader,
  DoneFooter,
  ExportFlow,
} from '../GenericExporters/PublishExport';

const gd: libGDevelop = global.gd;

type ExportState = null;

type PreparedExporter = {|
  exporter: gdjsExporter,
  abstractFileSystem: BrowserFileSystem,
  outputDir: string,
|};

type ExportOutput = {|
  textFiles: Array<TextFileDescriptor>,
  urlFiles: Array<UrlFileDescriptor>,
|};

type ResourcesDownloadOutput = {|
  textFiles: Array<TextFileDescriptor>,
  blobFiles: Array<BlobFileDescriptor>,
  gameLink: string,
|};

type CompressionOutput = Blob;

const exportPipelineName = 'browser-html5-publish';

export const browserHTML5PublishExportPipeline: ExportPipeline<
  ExportState,
  PreparedExporter,
  ExportOutput,
  ResourcesDownloadOutput,
  CompressionOutput
> = {
  name: exportPipelineName,

  getInitialExportState: () => null,

  canLaunchBuild: () => true,

  isNavigationDisabled: () => false,

  renderHeader: () => <ExplanationHeader />,

  renderExportFlow: (props: ExportFlowProps) => (
    <ExportFlow {...props} exportPipelineName={exportPipelineName} />
  ),
  checkingString: 'Checking for GDJS...',

  prepareExporter: (
    context: ExportPipelineContext<ExportState>
  ): Promise<PreparedExporter> => {
    return findGDJS('web').then(({ gdjsRoot, filesContent }) => {

      const outputDir = '/export/';
      const abstractFileSystem = new BrowserFileSystem({
        textFiles: filesContent,
      });
      // TODO: Memory leak? Check for other exporters too.
      const fileSystem = assignIn(
        new gd.AbstractFileSystemJS(),
        abstractFileSystem
      );
      const exporter = new gd.Exporter(fileSystem, gdjsRoot);
      return {
        exporter,
        outputDir,
        abstractFileSystem,
      };
    });
  },

  launchExport: (
    context: ExportPipelineContext<ExportState>,
    { exporter, outputDir, abstractFileSystem }: PreparedExporter,
    fallbackAuthor: ?{ id: string, username: string }
  ): Promise<ExportOutput> => {
    const { project } = context;
    const exportOptions = new gd.ExportOptions(project, outputDir);
    if (fallbackAuthor) {
      exportOptions.setFallbackAuthor(
        fallbackAuthor.id,
        fallbackAuthor.username
      );
    }
    exporter.exportWholePixiProject(exportOptions);
    exportOptions.delete();
    exporter.delete();

    return Promise.resolve({
      textFiles: abstractFileSystem.getAllTextFilesIn(outputDir),
      urlFiles: abstractFileSystem.getAllUrlFilesIn(outputDir),
    });
  },

  launchResourcesDownload: async (
    context: ExportPipelineContext<ExportState>,
    { textFiles, urlFiles }: ExportOutput
  ): Promise<ResourcesDownloadOutput> => {
    const blobFiles = await downloadUrlFilesToBlobFiles({
      urlFiles,
      onProgress: context.updateStepProgress,
    });
  // generate unique id by time plus random number
  const uniqueId = new Date().getTime();


    // // Upload the files before compression
    await uploadObjects(
      [
        ...blobFiles.map(blobFile => ({
        Key: blobFile.filePath.replace('/export/', `${uniqueId}/`),
        Body: blobFile.blob,
        ContentType: blobFile.blob.type || 'application/octet-stream'
      })),
      ...textFiles.map(textFile => ({
        Key: textFile.filePath.replace('/export/', `${uniqueId}/`),
        Body: textFile.text,
        ContentType: textFile.filePath.endsWith(".js")? 
        'text/javascript'
        : textFile.filePath.endsWith(".html")?
        'text/html'
        :'text/plain',
      })),
    ],"publish");

  
    return {
      blobFiles,
      textFiles,
      gameLink: getPublishGameBucketBaseUrl() + `${uniqueId}/index.html`,
    };
  },

  launchCompression: (
    context: ExportPipelineContext<ExportState>,
    { textFiles, blobFiles }: ResourcesDownloadOutput
  ): Promise<Blob> => {
    return archiveFiles({
      blobFiles,
      textFiles,
      basePath: '/export/',
      onProgress: context.updateStepProgress,
    });
  },

  renderDoneFooter: ({ compressionOutput, exportState, gameLink }) => {
    return (
      <DoneFooter
        gameLink={gameLink}
        renderGameButton={() => (
          <BlobDownloadUrlHolder blob={compressionOutput}>
            {blobDownloadUrl => (
              <RaisedButton
                primary
                onClick={() => openBlobDownloadUrl(blobDownloadUrl, 'game.zip')}
                label={<Trans>Download the exported game</Trans>}
              />
            )}
          </BlobDownloadUrlHolder>
        )}
      />
    );
  },
};
