import axios from 'axios';
import isUrl from 'is-url';
import errors from '../configs/errors';
import { ApiError, MissingDomainError } from '../errors';
import { DOMAIN_MAPPINGS } from '../configs/services/domains';
import { makeError, makeHttpClientError } from '../errors/make';
import { logResponse } from '../core/library/api-hooks';
import Stopwatch from '../core/Stopwatch';

export default class ApiService {
  /**
   * Create ApiService instance.
   */
  constructor() {
    const { URL_GATEWAY, API_GATEWAY_KEY } = process.env;

    this.domain = null;
    this.http = this._getClient();
    this.baseUrl = `http://${URL_GATEWAY}`;
    this.securedUrl = `https://${URL_GATEWAY}`;
    this.headers = { apiKey: API_GATEWAY_KEY };
  }


  /**
   * Set domain for the current class.
   *
   * @param {String} domain
   *
   * @returns {Self}
   */
  setDomain(domain) {
    this.domain = domain;

    return this;
  }

  /**
   * Set the base url for the current class.
   *
   * @param {String} url
   *
   * @returns {Self}
   */
  setUrl(url) {
    this.baseUrl = url;

    return this;
  }

  /**
   * Set authorization header
   *
   * @param {String} key
   * @param {String} value
   *
   * @returns {Self}
   */
  setHeader(key, value) {
    this.headers[key] = value;

    return this;
  }

  /**
   * Domain getter.
   * If an operation is passed, the method will look into the
   * "configs/services/domains" mapping file and return the specific
   * domain that returns desired result for the operation.
   *
   * @param {String} operation
   *
   * @returns {String}
   *
   * @throws {MissingDomainError}
   */
  getDomain(operation) {
    const { domain } = this;

    if (!domain) {
      throw new MissingDomainError('"domain" needs to be set to execute this service.');
    }

    if (!operation) {
      return domain;
    }

    if (!DOMAIN_MAPPINGS[domain] || !DOMAIN_MAPPINGS[domain][operation]) {
      throw new MissingDomainError(`Unknown ${domain} mapping. (external operation ${operation})`);
    }

    return DOMAIN_MAPPINGS[domain][operation];
  }

  /**
   * Create a custom HTTP client.
   *
   * @param {Number} [timeout=process.env.HTTP_CLIENT_TIMEOUT]
   *
   * @returns {axios}
   */
  _getClient(timeout = process.env.HTTP_CLIENT_TIMEOUT) {
    const client = axios.create({
      timeout: parseInt(timeout, 10),
    });

    const watch = Stopwatch.create();

    client.interceptors.request.use((config) => {
      watch.start();

      return config;
    });

    client.interceptors.response.use((response) => {
      logResponse(response, watch);

      return response;
    });

    return client;
  }

  /**
   * Generic get call to hydra.
   * If a full url is given, use that as the request url.
   * Else append baseUrl to it.
   *
   * @param {String} url
   * @param {String} query
   * @param {String} operation
   * @param {Function} transform
   * @param {Number} timeout
   *
   * @returns {Promise<Object>}
   */
  _get(url, query, operation, transform, timeout = 0) {
    const requestUrl = isUrl(url) ? url : this.baseUrl + url;
    const opts = { headers: this.headers };

    if (timeout > 0) {
      opts.timeout = timeout;
    }

    return new Promise((resolve, reject) => {
      this.http.get(`${requestUrl}?${query}`, opts)
        .then(response => this._extractResult(response, operation))
        .then((result) => {
          if (result instanceof ApiError) {
            return reject(result);
          }
          const data = transform ? transform(result) : result;

          return resolve(data);
        })
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Generic post request.
   *
   * @param {String} url
   * @param {Object} data
   * @param {Number} [timeout=0]
   *
   * @returns {Promise<Object>}
   */
  _post(url, data, timeout = 0) {
    const requestUrl = isUrl(url) ? url : this.baseUrl + url;
    const opts = { headers: this.headers };

    if (timeout > 0) {
      opts.timeout = timeout;
    }

    return new Promise((resolve, reject) => {
      this.http.post(requestUrl, data, opts)
        .then(response => resolve(response))
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Create a transformer that accepts domain to
   * append "image" key to the item.
   *
   * @param {Object} transformer
   * @param {String} method
   *
   * @returns {Function}
   */
  _transformerWithImage(transformer, method) {
    return data => transformer[method].call(transformer, data, this.getDomain());
  }

  /**
   * Attempt to extract the result from the response body of hydra call.
   * Will return an instance of ApiError if something is wrong with the result.
   *
   * @param {Object} response
   * @param {String} resultKey
   *
   * @returns {Object|Array|ApiError}
   */
  _extractResult(response, resultKey) {
    const { data } = response;

    if (data._callstatus.status === 'error') {
      const message = data._callstatus.error_message;
      const code = data._callstatus.error_code;

      return new ApiError(message, code);
    }

    if (!data._payload) {
      return new ApiError('Payload is empty please check the parameters.');
    }

    const result = data._payload.result[resultKey];

    if (resultKey === 'urlSourceLookup') {
      return data._payload.result.data;
    }

    if (errors[result] !== undefined) {
      return makeError(result);
    }

    return result;
  }
}
