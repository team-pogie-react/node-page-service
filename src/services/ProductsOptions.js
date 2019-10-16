import uuid from 'uuid';
import { parseInt as _parseInt } from 'lodash';
import ApiService from './ApiService';
import CacheInstance from '../core/Cache';
import { cache } from '../configs/services';
import { ApiError } from '../errors';
import { makeHttpClientError } from '../errors/make';
import { PRODUCTS_OPTIONS_API_URL } from '../configs/services/productsoptions';

export default class ProductsOptions extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();
    this.cache = CacheInstance;
  }

  /**
   * Function to get deafult options.
   *
   * @param {Object} params
   *
   * @returns {Promise<Object>}
   */
  defaultOPtions(params) {
    const fn = () => this._productOptionsRequest(
      `${PRODUCTS_OPTIONS_API_URL}/defaultOptionSet`,
      params,
    );

    const cacheKey = `po_default_options_${this.cache.generateKey(JSON.stringify(params))}`;

    return this.cache.remember(cacheKey, cache.PRODUCT_OPTIONS, fn);
  }

  /**
   * Function to get deafult options.
   *
   * @param {Object} params
   *
   * @returns {Promise<Object>}
   */
  filtered(params) {
    const fn = () => this._productOptionsRequest(
      `${PRODUCTS_OPTIONS_API_URL}/filteredOptionSet`,
      params,
    );

    const cacheKey = `po_filtererd_options_${this.cache.generateKey(JSON.stringify(params))}`;

    return this.cache.remember(cacheKey, cache.PRODUCT_OPTIONS, fn);
  }

  /**
   * Product Options Request.
   *
   * @param {String} url
   * @param {Object} params
   *
   * @returns {Promise<Object>}
   */
  _productOptionsRequest(url, params) {
    return new Promise((resolve, reject) => {
      this.http.post(url, this._prepareParams(params))
        .then((response) => {
          const { data } = response;

          resolve(data);
        })
        .catch((error) => {
          const { data } = error.response;

          if (data) {
            const code = _parseInt(data.ERROR_CODE);
            const apiError = new ApiError(data.ERROR_STRING, code, code);

            return reject(apiError);
          }

          return reject(makeHttpClientError(error));
        });
    });
  }

  /**
   * Prepare params for the actual products options api request.
   *
   * @param {Object} params
   *
   * @returns {Object}
   */
  _prepareParams(params) {
    return {
      REQID: uuid.v4(),
      DATA: {
        APP: {
          YEAR: params.year,
          MAKE: params.make,
          MODEL: params.model,
        },
        PART: { PARTNAME: params.part },
        PROD: { SKU: params.sku, BRANDNAME: params.brand },
        OPTIONS: params.options,
      },
    };
  }
}
