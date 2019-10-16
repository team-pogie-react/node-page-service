import BaseController from '../BaseController';
import QuickaddressService from '../../../services/Quickaddress';

export default class QuickaddressController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.qas = new QuickaddressService();
  }

  /**
   * Verify Address.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async verify(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderid = this.getOrderId(request);
      const {
        postcode, street, suburb, city, state, country,
      } = request.query;

      const qas = await this.qas.setDomain(domain).verify(
        orderid, {
          postcode, street, suburb, city, state, country,
        },
      );

      return response.withData(qas);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Refine Address.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async refine(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderid = this.getOrderId(request);
      const { srm } = request.query;
      const qas = await this.qas.setDomain(domain).refine(orderid, srm);

      return response.withData(qas);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }
}
