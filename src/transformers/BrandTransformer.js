import _ from 'lodash';
import Image from '../core/Image';

export default class BrandTransformer {
  /**
   * Transform top brands api response.
   *
   * @param {Object} brands
   * @param {String} domain
   *
   * @returns {Array}
   */
  topBrands(brands, domain) {
    if (!_.isObject(brands)) {
      return [];
    }

    const result = [];

    _.each(brands, (brand) => {
      const { tags, uri } = brand;
      const text = tags.brand;

      result.push({
        text,
        url: uri,
        image: Image.url(text, domain),
      });
    });

    return result;
  }
}
