import _ from 'lodash';
import { isFalsy } from '../core/helpers';

export default class MetaTransformer {
  /**
   * Transform meta object.
   * "meta": {
      "title": "string",
      "tags": [{
        "properties": [{
          "key": "name",
          "value": "string"
        }]
      }]
    }
   *
   * @param {Object} item
   *
   * @returns {Object}
   */
  collection(item) {
    if (isFalsy(item)) {
      return {};
    }

    const tags = [];

    _.each(item.tags.meta, (properties) => {
      tags.push({ properties: this._transformTag(properties) });
    });

    return { title: item.tags.title, tags };
  }

  /**
   * Transform tag properties array.
   *
   * @param {Array} properties
   *
   * @return {Array}
   */
  _transformTag(properties) {
    const result = [];

    _.each(properties, (tag) => {
      const { key, value } = tag;

      result.push({ key, value });
    });

    return result;
  }
}
