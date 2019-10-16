import BaseController from '../BaseController';
import ProductsService from '../../../services/Products';

export default class ProductsController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.products = new ProductsService();
  }

  /**
   * List of Products.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @return {Object} response
   */
  async index(request, response) {
    try {
      const domain = this.getDomain(request);
      const products = await this.products.setDomain(domain).search(request.query);

      return response.withData(products);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }
}
