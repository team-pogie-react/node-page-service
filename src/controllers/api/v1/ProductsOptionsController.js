import BaseController from '../BaseController';
import ProductsOptions from '../../../services/ProductsOptions';

export default class ProductsOptionsController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.objProductsOptionsService = new ProductsOptions();
  }

  /**
   * Function to get default option set.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @return {Object} response
   */
  async defaultOptions(request, response) {
    try {
      const result = await this.objProductsOptionsService.defaultOPtions(request.body);

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Function to get Filter options set.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @return {Object} response
   */
  async filtered(request, response) {
    try {
      const result = await this.objProductsOptionsService.filtered(request.body);

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }
}
