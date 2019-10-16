import _ from 'lodash';

export default class BrandTransformer {
  /**
   * Transform contents response for home page.
   *
   * @param {Object} contents
   *
   * @returns {Object}
   */
  forHome(contents) {
    if (!_.isObject(contents)) {
      return {};
    }

    const { featuredBrands, featuredMakes, featuredParts } = contents;

    return {
      featuredBrands: this._transformFeatured(featuredBrands),
      featuredMakes: this._transformFeatured(featuredMakes),
      featuredParts: this._transformFeatured(featuredParts),
    };
  }

  /**
   * Transform promotional banners response.
   *
   * @param {Array<Object>} banners
   *
   * @returns {Array}
   */
  banners(banners) {
    if (!_.isArray(banners)) {
      return [];
    }

    const result = [];

    _.each(banners, (banner) => {
      result.push(this._banner(banner));
    });

    return result;
  }

  /**
   * Transform featured items.
   *
   * @param {Object} items
   *
   * @returns {Array<Object>}
   */
  _transformFeatured(items) {
    const result = [];

    _.each(items.values, (item) => {
      const { text } = item;
      result.push({ text });
    });

    return result;
  }

  /**
   * Transform a single banner.
   *
   * @param {Object} banner
   *
   * @returns {Object}
   */
  _banner(banner) {
    const { keyword, priority } = banner;

    return {
      text: banner.promo_banner,
      image: banner.promo_banner_image,
      keyword,
      priority,
    };
  }
}
