import queryString from 'qs';
import ApiService from './ApiService';
import urls from '../configs/services/urls';
import operationKeys from '../configs/services/operation-keys';
import { QuickaddressError } from '../errors';
import TIMEOUTS from '../configs/timeouts';


export default class Quickaddress extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.http = this._getClient(TIMEOUTS.ORDER_2);
  }

  /**
   * Verify Address.
   *
   * @param {Integer} orderId
   * @param {Object} params
   *
   * @returns {Object<Promise>}
   */
  verify(orderId, params) {
    return new Promise((resolve) => {
      const results = {
        sVerifyLevel: 'Verified',
        Address: {
          delivery_street_address: params.street,
          delivery_suburb_address: params.suburb,
          delivery_city: params.city,
          delivery_state: params.state,
          delivery_postcode: params.postcode,
        },
      };

      return resolve(results);
    });
  }

  /**
   * Refine Address.
   *
   * @param {Integer} orderId
   * @param {String} srm
   *
   * @returns {Object<Promise>}
   */
  refine(orderId, srm) {
    return new Promise((resolve, reject) => {
      if (!srm) {
        return resolve(null);
      }

      return this._get(
        urls.ORDER_2 + orderId,
        this._getPayload(operationKeys.GET_QAS_REFINE, { srm }),
        operationKeys.GET_QAS_REFINE,
      ).then((result) => {
        if (result === false) {
          return reject(new QuickaddressError());
        }

        if (result.faultcode) {
          return reject(new QuickaddressError(result.detail));
        }

        return resolve(result);
      }).catch(error => reject(error));
    });
  }

  /**
   * Query uri for getting order details.
   *
   * @param {String} op
   * @param {Object} payload
   *
   * @returns {String}
   */
  _getPayload(op, payload) {
    return queryString.stringify({
      op,
      data: payload,
    }, { encodeValuesOnly: true });
  }
}
