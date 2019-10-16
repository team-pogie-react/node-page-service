import _ from 'lodash';
import { encodeToVLP } from '../core/helpers';

export default class VLPTransformer {
  /**
  * Convert the Object Params into a VLP valid format
  *
  * @param {Object} params
  *
  * @returns {String}
  */
  convertToVLPFormat(params) {
    const urlItems = [];
    const year = _.get(params, 'year', '');
    const make = _.get(params, 'make', '');
    const model = _.get(params, 'model', '');
    const submodel = _.get(params, 'submodel', '');
    const cylinders = _.get(params, 'cylinders', '');
    const liter = _.get(params, 'liter', '');

    if (year !== '') {
      urlItems.push(encodeToVLP(year));
    }

    if (make !== '') {
      urlItems.push(encodeToVLP(make));
    }

    if (model !== '') {
      urlItems.push(encodeToVLP(model));
    }

    if (submodel !== '') {
      urlItems.push(encodeToVLP(submodel));
    }

    if (cylinders !== '' && liter !== '') {
      const cylLiter = `${cylinders} Cyl ${liter}L`;

      urlItems.push(encodeToVLP(cylLiter));
    }

    if (urlItems.length) {
      return `/vehicle/${urlItems.join('/')}`;
    }

    return '';
  }
}
