import _ from 'lodash';
import overrides from '../../configs/services/overrides';

export default class BaseController {
  /**
   * Extract the domain from the request object.
   * This will always have a value as there's a middleware
   * that validates routes that needs domain parameter.
   *
   * @param {Object} request
   *
   * @returns {String}
   */
  getDomain(request) {
    const { query, body } = request;

    if (body && body.domain) {
      return body.domain;
    }

    if (query && query.domain) {
      return query.domain;
    }

    return '';
  }

  /**
   * Extract the orderId from the request object.
   * This needs to be passed to cart/checkout pages
   *
   * @param {Object} request
   *
   * @returns {String}
   */
  getOrderId(request) {
    const { query, body, params } = request;

    if (body && body.orderId) {
      return body.orderId;
    }

    if (query && query.orderId) {
      return query.orderId;
    }

    if (params && params.orderId) {
      return params.orderId;
    }

    return '';
  }

  /**
   * Extract the customerId from the request object.
   * This needs to be passed to account pages
   *
   * @param {Object} request
   *
   * @returns {String}
   */
  getCustomerId(request) {
    const { query, body, params } = request;

    if (body && body.customerId) {
      return body.customerId;
    }

    if (query && query.customerId) {
      return query.customerId;
    }

    if (params && params.customerId) {
      return params.customerId;
    }

    return '';
  }

  /**
   * Extract the overrides from the request object.
   * This needs to be passed to cart/checkout pages
   *
   * @param {Object} request
   *
   * @returns {String}
   */
  getOverrides(request) {
    const { query, body } = request;
    const req = {};

    _.each(overrides, (key, value) => {
      if (body && body[value]) {
        req[key] = body[value];
      }

      if (query && query[value]) {
        req[key] = query[value];
      }
    });

    return req;
  }
}
