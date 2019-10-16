import Promise from 'bluebird';
import { MOVED_PERMANENTLY } from 'http-status-codes';
import BaseController from '../BaseController';
import Category from '../../../services/Category';
import Products from '../../../services/Products';
import Breadcrumb from '../../../services/Breadcrumb';
import Breadcrumbs from '../../../configs/services/breadcrumbs';
import Vehicle from '../../../services/Vehicle';
import Meta from '../../../services/Meta';
import Metas from '../../../configs/services/metas';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import Widgets from '../../../configs/services/widgets';
import { compositeErrorHandler } from '../../../errors/handlers';

export default class SearchController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    this.categories = new Category();
    this.products = new Products();
    this.breadcrumb = new Breadcrumb();
    this.vehicles = new Vehicle();
    this.metas = new Meta();
    this.widgets = new StrapiWidget();
  }

  /**
   * Aggregate api responses for Search.
   *
   * @param Object $request
   * @param Object $response
   * @access public
   * @return Object
   */
  async search(request, response) {
    try {
      const domain = this.getDomain(request);
      const result = await Promise.all(this._aggregatedSearch(domain, request)).then(([
        meta,
        widgets,
        navigationCategories,
        products,
        breadcrumbs,
        years,
      ]) => {
        const { redirect } = products;

        if (redirect) {
          return Promise.resolve({
            pageType: 'page_redirect',
            redirectUri: redirect.value,
            requestUri: `/search?q=${request.query.q}`,
            statusCode: MOVED_PERMANENTLY,
          });
        }

        return Promise.resolve({
          meta,
          widgets,
          navigationCategories,
          products,
          breadcrumbs,
          years,
          pageType: Widgets.SEARCH,
        });
      });

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate service calls for Search.
   *
   * @param String $domain
   * @param Object $request
   * @access public
   * @return Array
   */
  _aggregatedSearch(domain, request) {
    const { query } = request;
    const metas = this.metas.setDomain(domain);
    const categories = this.categories.setDomain(domain);
    const products = this.products.setDomain(domain);
    const breadcrumb = this.breadcrumb.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    const productPromise = products.search(query);
    const breadcrumbs = productPromise
      .then(productResult => breadcrumb.getByPage(
        this._extractBreadcrumbTypes(productResult.selectedPart),
        this._extractBreadcrumbParams({
          q: query.q,
          selectedPart: productResult.selectedPart,
          part: productResult.items[0].part,
          topLevelCategory: productResult.items[0].topLevelCategory,
          category: productResult.items[0].category,
        }),
      ));

    return [
      metas.getByPage(Metas.SEARCH, query).catch(compositeErrorHandler),
      widgets.getByPage(Widgets.SEARCH).catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      productPromise.catch(compositeErrorHandler),
      breadcrumbs.catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
    ];
  }

  /**
   * Extract vehicle parameter for related categories from query.
   *
   * @param {Object} query
   *
   * @returns {Object}
   */
  _extractVehicleParams(query) {
    const { vehicle } = query;

    if (vehicle) {
      return {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
      };
    }

    return {};
  }

  /**
   * Extract breadcrumbs parameter.
   *
   * @param {Object} query
   *
   * @returns {Object}
   */
  _extractBreadcrumbParams(params) {
    let query = {};

    if (typeof params.selectedPart !== 'undefined' && params.selectedPart) {
      query = {
        first_level_category: params.topLevelCategory,
        second_level_category: params.category,
        part: params.part,
      };
    } else {
      query = {
        keywords: (typeof params.q !== 'undefined') ? params.q : params.part,
      };
    }

    return query;
  }

  /**
   * Extract breadcrumbs parameter.
   *
   * @param {Object} query
   *
   * @returns {Object}
   */
  _extractBreadcrumbTypes(selectedPart) {
    if (typeof selectedPart !== 'undefined' && selectedPart) {
      return Breadcrumbs.SEARCH_PART;
    }

    return Breadcrumbs.SEARCH_KEYWORDS;
  }
}
