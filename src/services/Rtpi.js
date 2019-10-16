import { isArray } from 'lodash';
import ApiService from './ApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls } from '../configs/services';
import { makeHttpClientError } from '../errors/make';

export default class Rtpi extends ApiService {
  /**
   * Get updated prices.
   *
   * @param {Array|Integer} productId
   *
   * @returns {Object<Promise>}
   */
  getPrices(productId) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${urls.RTPI}`;
      const body = {
        site: this.getDomain(),
        product_id: this._prepareIds(productId),
        type: 'price',
      };
      const opts = {
        headers: this.headers,
        timeout: TIMEOUTS.RTPI,
      };

      this.http.post(url, body, opts)
        .then((response) => {
          const { data } = response.data;

          resolve(data);
        })
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Prepare id if it will be passed as multiple or single.
   *
   * @param {Array|Integer} ids
   *
   * @return {String}
   */
  _prepareIds(id) {
    let ids = id;

    if (isArray(ids)) {
      ids = ids.join('|');
    }

    return ids;
  }
}
