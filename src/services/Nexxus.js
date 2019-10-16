import queryString from 'qs';
import ApiService from './ApiService';
import urls from '../configs/services/urls';
import TIMEOUTS from '../configs/timeouts';
import { makeHttpClientError } from '../errors/make';


export default class Nexxus extends ApiService {
  /**
   * Generic get call to hydra.
   * If a full url is given, use that as the request url.
   * Else append baseUrl to it.
   *
   * @param {String} url
   * @param {String} query
   * @param {String} operation
   * @param {Function} transform
   *
   * @returns {Object<Promise>}
   */

  _getNexusProxy(url, query, operation, transform) {
    const requestUrl = this.securedUrl + url;

    return new Promise((resolve, reject) => {
      this.http
        .get(`${requestUrl}?${query}`, {
          headers: this.headers,
          timeout: TIMEOUTS.MYACCOUNT_PROXY,
        })
        .then((response) => {
          const value = response.data;
          const result = value ? transform[operation](value) : null;

          resolve(result);
        })
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Perform request with the required data and services.
   *
   * @param {Object} query
   * @param {String} operation
   * @param {Function} transformer
   *
   * @returns {Object<Promise>}
   */
  _getResponse(query, operation, transformer) {
    return this._getNexusProxy(
      urls.MYACCOUNT_PROXY,
      this._nexxusQuery(query),
      operation,
      transformer,
    );
  }

  /**
   * Makes data a url query string format.
   *
   * @param {Object} data
   *
   * @returns {String}
   */
  _nexxusQuery(data) {
    return queryString.stringify(data, { encodeValuesOnly: true });
  }
}
