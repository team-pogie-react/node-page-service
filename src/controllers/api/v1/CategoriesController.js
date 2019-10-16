import BaseController from '../BaseController';
import CategoryService from '../../../services/Category';
import Meta from '../../../services/Meta';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import { compositeErrorHandler } from '../../../errors/handlers';

export default class CategoriesController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    this.metas = new Meta();
    this.widgets = new StrapiWidget();
    this.categories = new CategoryService();
  }

  /**
   * List of categories.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async index(request, response) {
    try {
      const domain = this.getDomain(request);
      const categories = await this.categories.setDomain(domain).get();

      return response.withData(categories);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Get Categories Parts
   * @param request
   * @param response
   * @returns {Object}
   */
  async getCategoryParts(request, response) {
    try {
      const domain = this.getDomain(request);
      const parts = await this.categories.setDomain(domain).getCategoryParts(request);

      return response.withData(parts);
    } catch (error) {
      return response.withError(error.message, error.code, error.code);
    }
  }

  /**
   * List Categories depending on the supplied tier.
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async getCategoryByLevel(request, response) {
    try {
      const domain = this.getDomain(request);
      let categoryData = [];
      if (request.params.topTier !== undefined) {
        const topTier = await this._parseCategoryTier(request.params.topTier);
        // Check if Second Tier is available as well.
        if (request.params.secondTier !== undefined) {
          const secondTier = await this._parseCategoryTier(request.params.secondTier);
          categoryData = await this.categories.setDomain(domain)
            .getCategoryPart(topTier, secondTier);
        } else {
          categoryData = await this.categories.setDomain(domain)
            .getTopTier(topTier);
        }
      }

      const result = await Promise.all(this._aggregatedCategoryByLevel(categoryData, domain))
        .then(([metas, widgets, categories]) => Promise.resolve({
          metas,
          widgets,
          categories,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate Categories
   * @param categories
   * @param domain
   * @returns {Array}
   * @private
   */
  _aggregatedCategoryByLevel(categories = [], domain) {
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage().catch(compositeErrorHandler),
      widgets.getByPage('seo').catch(compositeErrorHandler),
      categories,
    ];
  }

  /**
   * Converts slug into acceptable string for query.
   * @param category
   * @returns {Promise<any>}
   * @private
   */
  _parseCategoryTier(category) {
    return new Promise((resolve, reject) => {
      try {
        let parseCategory = category;
        // Replace dash to space
        parseCategory = parseCategory.replace(/-/g, ' ');
        // Convert the word 'and' to '&'
        parseCategory = parseCategory.replace('and', '&');

        resolve(parseCategory);
      } catch (error) {
        reject(error);
      }
    });
  }
}
