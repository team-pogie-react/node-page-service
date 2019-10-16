import queryString from 'qs';
import ApiService from './ApiService';
import urls from '../configs/services/urls';
import operationKeys from '../configs/services/operation-keys';
import ContentTransformer from '../transformers/ContentTransformer';

export default class Content extends ApiService {
  /**
   * Create service instance.
   */
  constructor() {
    super();

    this.transformer = new ContentTransformer();
  }

  /**
   * Get promotional banners.
   *
   * @returns {Object<Promise>}
   */
  promoBanners() {
    const operation = operationKeys.GET_PROMO_BANNERS;
    const query = queryString.stringify({
      op: operation,
      data: JSON.stringify({ site: this.getDomain(operation) }),
    }, { encode: false });

    const transform = this.transformer.banners.bind(this.transformer);

    return this._get(urls.CONTENT, query, operation, transform);
  }

  /**
   * Get contents for home page.
   *
   * @returns {Object}
   */
  forHome() {
    const operation = operationKeys.GET_CONTENTS;
    const query = queryString.stringify({
      op: operation,
      data: JSON.stringify({
        uri: '/',
        site: this.getDomain(operation),
      }),
    }, { encode: false });

    return new Promise((resolve, reject) => {
      this._get(urls.CONTENT_2, query, operation)
        .then((result) => {
          const { value } = result;
          const contents = value ? this.transformer.forHome(value) : null;

          resolve(contents);
        })
        .catch(error => reject(error));
    });
  }
}
