import { omit } from 'lodash';
import queryString from 'qs';
import ApiService from './ApiService';
import TIMEOUTS from '../configs/timeouts';
import urls from '../configs/services/urls';
import operationKeys from '../configs/services/operation-keys';
import { ApiError } from '../errors';
import { isFalsy } from '../core/helpers';
import OrderTransformer from '../transformers/OrderTransformer';
import { makeHttpClientError } from '../errors/make';

export default class Order extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.transformer = new OrderTransformer();
  }

  /**
   * Get Order details for cart.
   *
   * @param {Integer} orderId
   * @param {Object} data
   *
   * @returns {Object<Promise>}
   */
  forCart(orderId, data) {
    return this._getById(operationKeys.GET_ORDER, orderId, data, 'transformBasketOrder');
  }

  /**
   * Get Order details for checkout.
   *
   * @param {Integer} orderId
   *
   * @returns {Object<Promise>}
   */
  forCheckout(orderId, data) {
    return this._getById(operationKeys.GET_ORDER, orderId, data, 'transformCheckoutOrder');
  }

  /**
   * Get Order details for checkout confirmation pages.
   *
   * @param {Integer} orderId
   *
   * @returns {Object<Promise>}
   */
  forCheckoutConfirmation(orderId, data) {
    return this._getById(operationKeys.GET_ORDER, orderId, data, 'transformCheckoutConfirmation');
  }

  /**
   * Get Shipping Details.
   *
   * @param {Integer} orderid
   * @param {Object} overrides
   *
   * @returns {Object<Promise>}
   */
  shippingMethods(orderId, data) {
    return this._getById(operationKeys.GET_SHIPPING_METHOD, orderId, data, 'transformShippingMethods');
  }

  /**
   * Get CPG Braintree token.
   *
   * @returns {Object<Promise>}
   */
  getToken() {
    const data = queryString.stringify({
      op: operationKeys.GET_BT_TOKEN,
      data: JSON.stringify({ domain_name: this.getDomain() }),
    }, { encode: false });

    return this._get(
      this.securedUrl + urls.CPG,
      data,
      operationKeys.GET_BT_TOKEN,
      this.transformer.transformToken,
      TIMEOUTS.BRAINTREE,
    );
  }

  /**
   * Get Order Details.
   *
   * @param {Integer} orderId
   * @param {Object} data
   * @param {Object} data
   * @param {String} transformer method
   *
   * @returns {Object<Promise>}
   */
  _getById(operation, orderId, data, transformer) {
    return this._getOrders(
      this.securedUrl + urls.PROXY_ORDER + urls.ORDER,
      this._getPayload(operation, orderId, data),
      this._transformerWithImage(this.transformer, transformer),
    );
  }

  /**
   * Private get call to proxy service.
   *
   * @param {String} url
   * @param {String} query
   * @param {Function} transform
   *
   * @returns {Object<Promise>}
   */
  _getOrders(url, query, transform) {
    return new Promise((resolve, reject) => {
      this.http.get(`${url}?${query}`, { headers: this.headers, timeout: TIMEOUTS.ORDER_PROXY })
        .then(response => this._extractOrderResults(response.data))
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
   * Attempt to extract the result from the response body of proxy service.
   * Will return an instance of ApiError if something is wrong with the result.
   *
   * @param {Object} body
   *
   * @returns {Object|Array|ApiError}
   */
  _extractOrderResults(body) {
    if (body.results.error) {
      const { message } = body.results.error;
      const code = body.results.error.status_code;

      return new ApiError(message, code);
    }

    if (!body.results) {
      return new ApiError('Payload is empty please check the parameters.');
    }

    const result = body.results;

    if (result === '') {
      return new ApiError('No Results.');
    }

    return result;
  }

  /**
   * Query uri for getting order details.
   *
   * @param {String} orderId
   * @param {Object} data
   * @param {Object} query
   *
   * @returns {String}
   */
  _getPayload(operation, orderId, data) {
    const params = {};
    const newData = omit(data, 'iat');

    params.iat = encodeURI(data.iat);
    params.opt = operation;
    params.order_id = !isFalsy(orderId) ? orderId : 1;

    if (!isFalsy(newData)) {
      params.data = JSON.stringify(newData);
    }

    return (queryString.stringify(params, { encode: false }));
  }

  /**
   * Get UTC Time.
   *
   * @returns {String}
   */
  _getUTCTime() {
    const dt = new Date();
    const y = dt.getUTCFullYear();
    const d = dt.getUTCDate();
    const m = dt.getUTCMonth() + 1;
    const h = dt.getUTCHours();
    const i = dt.getUTCMinutes();
    const s = dt.getUTCSeconds();
    const utcTime = `${y}-${m}-${d} ${h}:${i}:${s} UTC`;

    return encodeURI(utcTime);
  }
}
