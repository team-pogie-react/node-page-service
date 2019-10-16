import { _ } from 'lodash';
import ApiService from './ApiService';
import VideoTransformer from '../transformers/VideoTransformer';

export default class Videos extends ApiService {
  /** @interitdoc */
  constructor() {
    super();
    this.videoTransformer = new VideoTransformer();
  }

  /**
   * Get data for shopByModels node
   *
   * @param {Object} attributes
   * @param {Array} displayNode
   *
   * @return {Object<Promise>}
   */

  getCommon() {
    return new Promise((resolve) => {
      const result = [];
      const channels = process.env.CHANNELS.split('|');

      _.each(channels, (channel) => {
        result.push(this.videoTransformer.getCommon(channel));
      });

      return resolve(result);
    });
  }

  getVideoBySku(sku) {
    return new Promise((resolve) => {
      const result = [];
      const channels = process.env.CHANNELS.split('|');

      _.each(channels, (channel) => {
        result.push(this.videoTransformer.getVideoBySku(channel, sku));
      });

      return resolve(result);
    });
  }

  getCategoryVideo(catId) {
    return new Promise((resolve) => {
      const result = [];
      const channels = process.env.CHANNELS.split('|');

      _.each(channels, (channel) => {
        result.push(this.videoTransformer.getCategoryVideo(channel, catId));
      });

      return resolve(result);
    });
  }
}
