import queryString from 'qs';
import _ from 'lodash';
import Rtpi from './Rtpi';
import CacheInstance from '../core/Cache';
import { ApiError, NoResultError } from '../errors';
import ApiService from './ApiService';
import urls from '../configs/services/urls';
import { operationKeys, cache } from '../configs/services';
import ProductsTransformer from '../transformers/ProductsTransformer';
import {
  VEHICLE_PARAMS,
  FILTER_PARAMS,
  FILTER_BOOLEAN,
  SORT_PARAMS,
  ATTRIBUTE_PARAM,
} from '../configs/services/search-params';
import { encode, isFalsy } from '../core/helpers';
import TIMEOUTS from '../configs/timeouts';
import { makeHttpClientError } from '../errors/make';


export default class Products extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.cache = CacheInstance;
    this.rtpi = new Rtpi();
    this.transformer = new ProductsTransformer();
  }

  /**
   * Search products.
   *
   * @param {Object} queryParams
   *
   * @returns {Object<Promise>}
   */
  search(queryParams) {
    return new Promise((resolve, reject) => {
      const key = `search_${this.cache.generateKey(queryParams)}`;
      const domain = this.getDomain(operationKeys.GET_PRODUCTS);
      const sortOrder = SORT_PARAMS[_.get(queryParams, 'sort', 'best-match')];

      this.cache
        .remember(key, cache.PRODUCT_LISTINGS, () => this._searchRequest(queryParams))
        .then((result) => {
          this._getUpdatedPrices(result.product_ids, domain).then((prices) => {
            resolve(this.transformer.transformProductResults(result, sortOrder, domain, prices));
          }).catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Get product details.
   *
   * @param {Object} queryParams
   * @param {Boolean} isPla
   *
   * @returns {Object<Promise>}
   */
  details(queryParams, isPla = false) {
    return new Promise((resolve, reject) => {
      const key = `pdp_${this.cache.generateKey(queryParams)}`;

      this.cache
        .remember(key, cache.PRODUCT_PAGE, () => this._detailsRequest(queryParams))
        .then((result) => {
          const domain = this.getDomain(operationKeys.GET_PRODUCT_DETAILS);
          const { id } = result.products;

          this._getUpdatedPrices(id, domain).then((prices) => {
            resolve(this.transformer.transformProductDetails(result, domain, isPla, prices));
          }).catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Search request promise.
   *
   * @param {Object} queryParams
   *
   * @returns {Promise<Object>}
   */
  _searchRequest(queryParams) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this._getSearchUrl()}?${this._getSearchQuery(queryParams)}`, {
          headers: this.headers,
          timeout: TIMEOUTS.SEARCH,
        })
        .then(response => this._extractProductResult(response))
        .then((result) => {
          if (result instanceof ApiError) {
            return reject(result);
          }

          return resolve(result);
        })
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Get product details request.
   *
   * @param {Object} queryParams
   *
   * @returns {Object<Promise>}
   */
  _detailsRequest(queryParams) {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this._getDetailsUrl()}?${this._getDetailsQuery(queryParams)}`, {
          headers: this.headers,
          timeout: TIMEOUTS.PRODUCT_DETAILS,
        })
        .then(response => this._extractProductResult(response))
        .then((result) => {
          if (result instanceof ApiError) {
            return reject(result);
          }

          return this._getVendor(result);
        })
        .then(result => resolve(result))
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Get updated prices.
   *
   * @param {Array|Integer} id
   * @param {String} domain
   *
   * @returns {Promise<Object>}
   */
  _getUpdatedPrices(id, domain) {
    return this.rtpi.setDomain(domain).getPrices(id);
  }

  /**
   * Get vendor details for the product result.
   *
   * @param {Object} result
   *
   * @returns {Promise<Object>}
   */
  _getVendor(result) {
    return new Promise((resolve, reject) => {
      if (isFalsy(result) || isFalsy(result.products)) {
        return reject(new NoResultError('Product does not exist.'));
      }

      const productResult = result.products;

      if (!productResult.isvendor) {
        return resolve(result);
      }

      const params = {
        brand: productResult.brand_name,
        part: productResult.part_name,
        sku: productResult.sku,
        REQUEST_URI: productResult.product_uri,
        univ: 'Univ',
      };

      return this._doGetVendor(result, params)
        .then(resultWithVendor => resolve(resultWithVendor))
        .catch(error => reject(error));
    });
  }

  /**
   * Attempt to get a cached copy of vendor.
   *
   * @param {Object} result
   * @param {Object} params
   *
   * @returns {Promise<Object>}
   */
  _doGetVendor(result, params) {
    const fn = () => new Promise((resolve, reject) => {
      const newResult = Object.assign({}, result);

      this._get(
        urls.CATALOG_2,
        this._getVendorQuery(params),
        operationKeys.PDP.GET_PRODUCT_DETAILS,
        null,
      ).then((vendorResult) => {
        newResult.products.vendor = vendorResult.value.vendor;

        resolve(newResult);
      }).catch(error => reject(error));
    });

    const cacheKey = `get_vendor_${this.cache.generateKey(JSON.stringify(params))}`;

    return this.cache.remember(cacheKey, cache.GET_VENDOR, fn);
  }

  /**
   * Create vendor query.
   *
   * @param {Object} params
   *
   * @returns {Object}
   */
  _getVendorQuery(params) {
    const operation = operationKeys.PDP.GET_PRODUCT_DETAILS;

    return queryString.stringify({
      op: JSON.stringify({
        [operation]: {},
      }),
      data: JSON.stringify({
        catalogSource: 'Endeca',
        catalogType: 'Auto',
        site: this.getDomain(operation),
        showProductCount: 1,
        ...params,
      }),
    });
  }

  /**
   * Create search query string from params.
   *
   * @param {Object} params
   *
   * @return {String}
   */
  _getSearchQuery(params) {
    const vehicles = {};
    const paramResults = { rows: 15 };

    _.each(params, (value, key) => {
      switch (key) {
        case 'q':
          paramResults[key] = encode(value);
          break;
        case 'vehicle':
          _.each(value, (vehVal, vehKey) => {
            vehicles[VEHICLE_PARAMS[vehKey]] = vehVal;
          });
          paramResults[key] = vehicles;
          break;
        case 'attributes':
          _.each(value, (attrVal, attrKey) => {
            paramResults[ATTRIBUTE_PARAM + attrKey] = encode(attrVal);
          });
          break;
        case 'filters':
          _.each(FILTER_PARAMS, (paramsVal, paramsKey) => {
            if (typeof value[paramsKey] !== 'undefined') {
              if (paramsVal === 'isuniversal') {
                paramResults[paramsVal] = FILTER_BOOLEAN[value[paramsKey]];
              } else {
                paramResults[paramsVal] = encode(value[paramsKey]);
              }
            }
          });
          break;
        case 'sort':
          if (value === 'best-match') {
            paramResults[key] = SORT_PARAMS['best-match'];
          } else if (value === 'price-low') {
            paramResults[key] = SORT_PARAMS['price-low'];
          } else if (value === 'price-high') {
            paramResults[key] = SORT_PARAMS['price-high'];
          }
          break;
        case 'itemperpage':
          paramResults.rows = value;
          break;
        case 'currentpage':
          paramResults.start = value;
          break;
        default:
      }
    });

    paramResults.domain = this.getDomain(operationKeys.GET_PRODUCTS);

    return queryString.stringify(paramResults, { encodeValuesOnly: true });
  }

  /**
   * Create search query string from params.
   *
   * @param {Object} params
   *
   * @return {String}
   */
  _getDetailsQuery(params) {
    const vehicles = {};
    const paramResults = {};

    _.each(params, (value, key) => {
      switch (key) {
        case 'vehicle':
          _.each(value, (vehVal, vehKey) => {
            vehicles[VEHICLE_PARAMS[vehKey]] = vehVal;
          });
          paramResults[key] = vehicles;
          break;
        case 'filters':
          _.each(FILTER_PARAMS, (paramsVal, paramsKey) => {
            if (typeof value[paramsKey] !== 'undefined') {
              if (paramsVal === 'isuniversal') {
                paramResults[paramsVal] = FILTER_BOOLEAN[value[paramsKey]];
              } else {
                paramResults[paramsVal] = encode(value[paramsKey]);
              }
            }
          });
          break;
        case 'sku':
        case 'yearRange':
          paramResults[key] = value;
          break;
        default:
      }
    });

    paramResults.domain = this.getDomain(operationKeys.GET_PRODUCTS);

    return queryString.stringify(paramResults, { encodeValuesOnly: true });
  }

  /**
   * Search url.
   *
   * @returns {String}
   */
  _getSearchUrl() {
    return this.baseUrl + urls.SEARCH + operationKeys.GET_PRODUCTS;
  }

  /**
   * Search url.
   *
   * @returns {String}
   */
  _getDetailsUrl() {
    return this.baseUrl + urls.DETAILS + operationKeys.GET_PRODUCT_DETAILS;
  }


  /**
   * Extract product result.
   *
   * @param {Object} response
   *
   * @returns {Object|Array|ApiError}
   */
  _extractProductResult(response) {
    const { data } = response;

    if (data.results.error) {
      const { message } = data.results.error;
      const status = data.results.error.status_code;
      const customCode = data.results.error.custom_code;

      return new ApiError(message, customCode, status);
    }

    if (!data.results) {
      return new ApiError('Payload is empty please check the parameters.');
    }

    const result = data.results;

    if (result === '') {
      return new ApiError('No Results.');
    }

    return result;
  }
}
