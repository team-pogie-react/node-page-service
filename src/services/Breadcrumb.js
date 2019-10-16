import ApiService from './ApiService';
import CacheInstance from '../core/Cache';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import { makeHttpClientError } from '../errors/make';
import BreadcrumbTransformer from '../transformers/BreadcrumbTransformer';

export default class Breadcrumb extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.transformer = new BreadcrumbTransformer();
    this.cache = CacheInstance;
  }

  /**
   * Get breadcrumbs of a page type based on the parameters.
   *
   * @param {String} page
   * @param {Object} params
   *
   * @returns {Object<Promise>}
   */
  getByPage(page, params) {
    const fn = () => new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${urls.BREAD_CRUMBS}${page}`;
      const body = { site: this.getDomain(), data: params };
      const opts = {
        headers: this.headers,
        timeout: TIMEOUTS.SEO_NEXUS,
      };

      this.http.post(url, body, opts)
        .then((response) => {
          const { data } = response.data;

          resolve(this.transformer.collection(data.breadcrumbs));
        }).catch(error => reject(makeHttpClientError(error)));
    });

    const key = this._getByPageCacheKey(page, params);

    return this.cache.remember(key, cache.GET_BREADCRUMBS, fn);
  }

  /**
   * getByPage method cache key.
   *
   * @param {String} page
   * @param {Object} params
   *
   * @returns {String}
   */
  _getByPageCacheKey(page, params) {
    return `get_bread_crumbs_by_page_${page}_${this.cache.generateKey(JSON.stringify(params))}`;
  }
}
