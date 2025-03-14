// @flow
import Window from '../Window';

const isDev = Window.isDev();

export const GDevelopGamePreviews = {
  // baseUrl: `https://game-previews.gdevelop.io/`,
  baseUrl: `https://liteengine-games-preview.s3.eu-central-1.amazonaws.com/`,
};
export const TelegramGameBucket = {
  baseUrl: `https://liteengine-games-telegram.s3.eu-central-1.amazonaws.com/`,
};
export const PublishGameBucket = {
  baseUrl: `https://d3ku8paksnaipo.cloudfront.net/`,
};


export const GDevelopGamesPlatform = {
  getInstantBuildUrl: (buildId: string) =>
    isDev
      ? `https://gd.games/instant-builds/${buildId}?dev=true`
      : `https://gd.games/instant-builds/${buildId}`,
  getGameUrl: (gameId: string) =>
    isDev
      ? `https://gd.games/games/${gameId}?dev=true`
      : `https://gd.games/games/${gameId}`,
  getGameUrlWithSlug: (userSlug: string, gameSlug: string) =>
    isDev
      ? `https://gd.games/${userSlug.toLowerCase()}/${gameSlug.toLowerCase()}?dev=true`
      : `https://gd.games/${userSlug.toLowerCase()}/${gameSlug.toLowerCase()}`,
  getUserPublicProfileUrl: (userId: string, username: ?string) =>
    username
      ? `https://gd.games/${username}${isDev ? '?dev=true' : ''}`
      : `https://gd.games/user/${userId}${isDev ? '?dev=true' : ''}`,
};

export const GDevelopFirebaseConfig = {
  apiKey: 'AIzaSyAnX9QMacrIl3yo4zkVFEVhDppGVDDewBc',
  authDomain: 'gdevelop-services.firebaseapp.com',
  databaseURL: 'https://gdevelop-services.firebaseio.com',
  projectId: 'gdevelop-services',
  storageBucket: 'gdevelop-services.appspot.com',
  messagingSenderId: '44882707384',
};
// export const GDevelopFirebaseConfig = {
//   apiKey: "AIzaSyDPZpyJUeGv3YXrbcpSpSB-6KgmaXuxIG0",
//   authDomain: "juke-294714.firebaseapp.com",
//   databaseURL: "https://juke-294714-default-rtdb.firebaseio.com",
//   projectId: "juke-294714",
//   storageBucket: "juke-294714.firebasestorage.app",
//   messagingSenderId: "532299207615",
//   appId: "1:532299207615:web:1dac0fecb5c614a30cc70a",
//   measurementId: "G-LYDYFGV6MC"
// };

export const GDevelopAuthorizationWebSocketApi = {
  baseUrl: isDev
    ? 'wss://api-ws-dev.gdevelop.io/authorization'
    : 'wss://api-ws.gdevelop.io/authorization',
};

export const GDevelopBuildApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/build'
    : 'https://enginecore-be.sonicengine.net/build',
};

export const GDevelopUsageApi = {
  baseUrl: isDev
    ? 'https://engine-be.sonicengine.net/usage' // 'https://api-dev.gdevelop.io/usage'
    : 'https://engine-be.sonicengine.net/usage', // 'https://enginecore-be.sonicengine.net/usage'
};

export const TelegramApi = {
  baseUrl: isDev
    ? 'https://engine-be.sonicengine.net/telegram'
    : 'https://engine-be.sonicengine.net/telegram',
};

export const ProjectApi = {
  baseUrl: isDev
    ? 'https://engine-be.sonicengine.net/project'
    : 'https://engine-be.sonicengine.net/project',
};

export const GDevelopReleaseApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/release'
    : 'https://enginecore-be.sonicengine.net/release',
};

export const GDevelopAssetApi = {
  baseUrl: isDev
    ? 'https://engine-be.sonicengine.net/asset'
    : 'https://engine-be.sonicengine.net/asset',
};

export const GDevelopAssetCoreApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/asset'
    : 'https://enginecore-be.sonicengine.net/asset',
};

export const GDevelopAnalyticsApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/analytics'
    : 'https://enginecore-be.sonicengine.net/analytics',
};

export const GDevelopGameApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/game'
    : 'https://enginecore-be.sonicengine.net/game',
};

export const GDevelopUserApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/user'
    : 'https://enginecore-be.sonicengine.net/user',
};

export const GDevelopPlayApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/play'
    : 'https://enginecore-be.sonicengine.net/play',
};

export const GDevelopShopApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/shop'
    : 'https://enginecore-be.sonicengine.net/shop',
};

export const GDevelopProjectApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/project'
    : 'https://enginecore-be.sonicengine.net/project',
};

export const GDevelopGenerationApi = {
  baseUrl: isDev
    ? 'https://enginecore-be.sonicengine.net/generation'
    : 'https://enginecore-be.sonicengine.net/generation',
};

export const GDevelopProjectResourcesStorage = {
  baseUrl: isDev
    ? 'https://project-resources-dev.gdevelop.io'
    : 'https://project-resources.gdevelop.io',
};

export const GDevelopPrivateAssetsStorage = {
  baseUrl: isDev
    ? 'https://private-assets-dev.gdevelop.io'
    : 'https://private-assets.gdevelop.io',
};

export const GDevelopPrivateGameTemplatesStorage = {
  baseUrl: isDev
    ? 'https://private-game-templates-dev.gdevelop.io'
    : 'https://private-game-templates.gdevelop.io',
};

export const GDevelopPublicAssetResourcesStorageBaseUrl =
  'https://asset-resources.gdevelop.io';
export const GDevelopPublicAssetResourcesStorageStagingBaseUrl =
  'https://asset-resources.gdevelop.io/staging';
