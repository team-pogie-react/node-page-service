import _ from 'lodash';
import { isFalsy, decode } from '../core/helpers';

export default class BreadcrumbTransformer {
  /**
   * Transform breadcrumbs array.
   *
   * @param {Array} items
   *
   * @returns {Object}
   */
  collection(items) {
    if (isFalsy(items)) {
      return [];
    }
    const result = [];

    _.each(items, (item) => {
      result.push({ text: decode(item.text), value: item.url });
    });

    return result;
  }
}
