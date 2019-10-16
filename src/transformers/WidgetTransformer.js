import _ from 'lodash';
import { isFalsy } from '../core/helpers';

export default class WidgetTransformer {
  /**
   * Transform widget response.
   *
   * @param {Object|Array} widgets
   *
   * @returns {Object}
   */
  collection(widgets) {
    if (isFalsy(widgets)) {
      return [];
    }

    if (!_.isArray(widgets)) {
      return [widgets];
    }

    return widgets;
  }
}
