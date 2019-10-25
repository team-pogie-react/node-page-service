import _ from 'lodash';
import { ApiError } from '../errors';
import errors from '../configs/errors';
import { makeError } from '../errors/make';
import ApiService from './ApiService';

export default class SeoApiService extends ApiService {
  /**
   * Create a transformer
   *
   * @param {Object} transformer
   * @param {String} method
   *
   * @returns {Function}
   */
  _transformData(transformer, method) {
    return data => transformer[method].call(transformer, data);
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
    if (data.results  && (data.results.status_code || data.results.success)) {
      return this._extractPageResults(data, resultKey);
    }

    if (typeof data._callstatus !== 'undefined' && data._callstatus.status === 'error') {
      const message = data._callstatus.error_message;
      const code = data._callstatus.error_code;

      return new ApiError(message, code);
    }

    if (typeof data.results !== 'undefined' && !data._payload) {
      return new ApiError('Payload is empty please check the parameters.');
    }

    let result = {};

    if (resultKey instanceof Array) {
      const res = data._payload.result;
      _.each(resultKey, (item) => {
        if (item in res) {
          if (res[item] in errors) {
            const errCode = res[item];
            result[item] = errors[errCode];
          } else {
            result[item] = res[item];
          }
        } else {
          result = res;
        }
      });

      return result;
    }

    if (typeof data.results !== 'undefined' && typeof data._payload === 'undefined') {
      result = this._extractStaticContentData(data.results);
    } else {
      result = data._payload.result[resultKey];
    }

    if (errors[result] !== undefined) {
      return makeError(result);
    }

    return result;
  }

  _extractStaticContentData(results) {
    // Get Static Pages
    if (typeof results.data.PolicyDescription !== 'undefined') {
      return {
        text: results.data.PolicyDescription,
      };
    }
    // Get Contents
    if (typeof results.data.block !== 'undefined') {
      const data = {
        makes: null,
        brands: null,
        parts: null,
      };
      _.forEach(results.data.block, (result) => {
        const currentSet = result.text.data;
        const dataSet = [];
        _.forEach(result.dataset.data, (dataItem) => {
          if (currentSet === 'popularSearches') {
            dataSet.push(dataItem);
          } else {
            dataSet.push(dataItem[0]);
          }
        });
        data[currentSet] = dataSet;
      });

      return data;
    }

    return null;
  }

  /**
   * Attempt to extract the result from the response body of hydra call.
   * Will return an instance of ApiError if something is wrong with the result.
   * This is specifically use for Page service response extraction.
   *
   * @param {Object} body
   * @param {String} resultKey
   *
   * @returns {Object|Array|ApiError}
   */
  _extractPageResults(body, resultKey) {
    const statusCode = _.get(body, 'results.status_code', 404);

    if (statusCode !== 200 && statusCode !== '200') {
      return _.get(body, 'results', {});
    }

    const result = {};

    if (resultKey instanceof Array) {
      const res = body.results;

      _.each(resultKey, (item) => {
        if (item in res) {
          result[item] = res[item];
        }
      });

      return result;
    }

    return body.results[resultKey];
  }
}
