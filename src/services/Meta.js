import ApiService from './ApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import MetaTransformer from '../transformers/MetaTransformer';
import CacheInstance from '../core/Cache';
import { makeHttpClientError } from '../errors/make';

export default class Meta extends ApiService {
  /**
   * Create service instance.
   */
  constructor() {
    super();

    this.transformer = new MetaTransformer();
    this.cache = CacheInstance;
  }

  /**
   * Get Meta.
   *
   * @param {String} page
   * @param {Object} params
   *
   * @returns {Object<Promise>}
   */
  getByPage(page, params) {
    const fn = () => new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${urls.METAS}${page}`;
      const body = { site: this.getDomain(), data: params };
      const opts = {
        headers: this.headers,
        timeout: TIMEOUTS.SEO_NEXUS,
      };

      this.http.post(url, body, opts)
        .then((response) => {
          const { data } = response.data;

          resolve(this.transformer.collection(data));
        })
        .catch(error => reject(makeHttpClientError(error)));
    });

    const key = this._getByPageCacheKey(page, params);

    return this.cache.remember(key, cache.GET_META, fn);
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
    return `get_meta_by_page_${page}_${this.cache.generateKey(JSON.stringify(params))}`;
  }
}
