// @flow
import axios from 'axios';
import { GDevelopGamePreviews, PublishGameBucket, TelegramGameBucket } from './ApiConfigs';
import { getSignedUrls } from './Usage';

export type UploadedObject = {|
  Key: string,
  Body: string,
  ContentType: 'text/javascript' | 'text/html',
|};

export const uploadObjects = async (
  uploadedObjects: Array<UploadedObject>,
  uploadType: string = 'preview'
): Promise<void> => {
  const { signedUrls } = await getSignedUrls({
    uploadType: uploadType,
    files: uploadedObjects.map(params => ({
      key: params.Key,
      contentType: params.ContentType,
    })),
  });

  if (signedUrls.length !== uploadedObjects.length) {
    throw new Error(
      'Unexpected response from the API (signed urls count is not the same as uploaded objects count).'
    );
  }

  await Promise.all(
    uploadedObjects.map((params, index) =>
      axios.put(signedUrls[index], params.Body, {
        headers: {
          'Content-Type': params.ContentType,
        },
      })
    )
  );
};

export const getPreSignedUrls = async (
  uploadedObjects: Array<UploadedObject>,
  walletAddress: string,
  uploadType: string = 'projects'
): Promise<string[]> => { 
  const IdUnix = new Date().getTime();
  const { signedUrls } = await getSignedUrls({
    uploadType: uploadType,
    files: uploadedObjects.map(params => ({
      key: walletAddress + "/" + IdUnix + "/" + params.Key,
      contentType: params.ContentType,
    })),
  });

  if (signedUrls.length !== uploadedObjects.length) {
    throw new Error(
      'Unexpected response from the API (signed urls count is not the same as uploaded objects count).'
    );
  }

  return signedUrls;
};

export const getBaseUrl = () => {
  return GDevelopGamePreviews.baseUrl;
};

export const getTelegramS3BaseUrl = () => {
  return TelegramGameBucket.baseUrl;
}

export const getPublishGameBucketBaseUrl = () => {
  return PublishGameBucket.baseUrl;
}