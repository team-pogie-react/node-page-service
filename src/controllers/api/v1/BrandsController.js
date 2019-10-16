import BaseController from '../BaseController';
import BrandTransformer from '../../../transformers/BrandTransformer';
import Seo from '../../../services/Seo';

export default class BrandsController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.transformer = new BrandTransformer();
    this.seo = new Seo();
  }

  /**
   * List of brands.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async topBrands(request, response) {
    try {
      const limit = request.query.limit || 10;
      const domain = this.getDomain(request);
      const brands = await this.seo.setDomain(domain).topBrands(limit);

      return response.withData(brands);
    } catch (error) {
      return response.withError(error.message, error.status);
    }
  }
}
