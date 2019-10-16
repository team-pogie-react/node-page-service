import videoConfig from '../configs/services/videos';

export default class VideoTransformer {
  getCommon(channelId) {
    const configStructure = {
      loginid: process.env.LOGIN_ID,
      playlist: 'show',
      channel: {
        id: channelId,
      },
      targetEl: '',
      apiBaseUrl: process.env.VIDEO_API_BASE_URL,
    };

    const config = {
      config: configStructure,
      jsSrc: '',
    };

    if (!(channelId in videoConfig)) {
      throw new Error(`No mapping for the given channel ${channelId}`);
    }
    const targetEl = videoConfig[channelId];

    const targetBaseUrl = process.env.VIDEO_JS_BASE_URL;
    config.config.targetEl = targetEl;
    config.config.channel.id = channelId;
    config.jsSrc = `${targetBaseUrl}/tvpwidget/${targetEl}/index.js`;

    return config;
  }

  getVideoBySku(channelId, sku) {
    const configStructure = {
      loginid: process.env.LOGIN_ID,
      playlist: 'show',
      channel: {
        id: channelId,
        parameters: {},
      },
      targetEl: '',
      apiBaseUrl: process.env.VIDEO_API_BASE_URL,
    };

    const config = {
      config: configStructure,
      jsSrc: '',
    };

    if (!(channelId in videoConfig)) {
      throw new Error(`No mapping for the given channel ${channelId}`);
    }
    const targetEl = videoConfig[channelId];

    const targetBaseUrl = process.env.VIDEO_JS_BASE_URL;
    config.config.targetEl = targetEl;
    config.config.channel.parameters.referenceId = sku ? sku.toLowerCase() : '';
    config.jsSrc = `${targetBaseUrl}/tvpwidget/${targetEl}/index.js`;

    return config;
  }

  getCategoryVideo(channelId, catId) {
    const configStructure = {
      loginid: process.env.LOGIN_ID,
      playlist: 'show',
      channel: {
        id: channelId,
        parameters: {},
      },
      targetEl: '',
      apiBaseUrl: process.env.VIDEO_API_BASE_URL,
    };

    const config = {
      config: configStructure,
      jsSrc: '',
    };

    if (!(channelId in videoConfig)) {
      throw new Error(`No mapping for the given channel ${channelId}`);
    }
    const urlType = videoConfig[channelId];
    const targetEl = videoConfig.category_config[channelId];

    const targetBaseUrl = process.env.VIDEO_JS_BASE_URL;
    config.config.targetEl = targetEl;
    config.config.channel.parameters.s = catId ? encodeURI(catId) : '';
    config.jsSrc = `${targetBaseUrl}/tvpwidget/${urlType}/index.js`;

    return config;
  }
}
