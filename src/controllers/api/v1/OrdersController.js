import BaseController from '../BaseController';
import OrderService from '../../../services/Order';

export default class OrdersController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.order = new OrderService();
  }

  /**
   * Order Details.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async find(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderid = this.getOrderId(request);
      const order = await this.order.setDomain(domain).forCheckout(orderid);

      return response.withData(order);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Get Shipping Methods.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async shippingMethods(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderId = this.getOrderId(request);
      const overrides = this.getOverrides(request);
      const methods = await this.order.setDomain(domain).shippingMethods(orderId, overrides);

      return response.withData(methods);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Get CPG Braintree token.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async getToken(request, response) {
    try {
      const domain = this.getDomain(request);
      const checkout = await this.order.setDomain(domain).getToken();

      return response.withData(checkout);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }
}
