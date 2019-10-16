import { _ } from 'lodash';
import BaseController from '../../BaseController';
import BreadCrumb from '../../../../services/Breadcrumb';
import Catalog from '../../../../services/Catalog';
import Meta from '../../../../services/Meta';
import Vehicle from '../../../../services/Vehicle';
import Category from '../../../../services/Category';
import Widgets from '../../../../services/widgets/StrapiWidget';
import SeoFormatter from '../../../../core/library/seo/url/formatter';
import { compositeErrorHandler } from '../../../../errors/handlers';
import BreadcrumbConfig from '../../../../configs/services/breadcrumbs';
import MetasConfig from '../../../../configs/services/metas';
import WidgetsConfig from '../../../../configs/services/widgets';

export default class NonStandardController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.vehicles = new Vehicle();
    this.catalog = new Catalog();
    this.widgets = new Widgets();
    this.breadCrumb = new BreadCrumb();
    this.seoFormatter = new SeoFormatter();
    this.meta = new Meta();
    this.category = new Category();
    this.breadcrumbConfig = BreadcrumbConfig || {};
    this.metasConfig = MetasConfig || {};
    this.widgetsConfig = WidgetsConfig || {};
    this.pageType = 'BRAND';
    this.prefix = 'SEO_';
  }

  /**
   * Get brand.
   *
   * @param {Object} request
   * @param {String} domain
   * @param {String} page
   *
   * @returns {Object<Promise>}
   */
  async index(request, domain, page) {
    const { uri } = request.query;
    const pageData = _.get(page, 'articles') || {};
    const result = await Promise.all(
      this._aggregatedCall(domain, uri, page.attributes),
    )
      .then(([
        widgetsResponse,
        breadCrumbsResponse,
        yearsReponse,
        metasResponse,
        navigationCategoriesResponse,
      ]) => Promise.resolve({
        articles: pageData,
        breadcrumbs: breadCrumbsResponse,
        meta: metasResponse,
        navigationCategories: navigationCategoriesResponse,
        pageType: _.get(page, 'page_type'),
        widgets: widgetsResponse,
        years: yearsReponse,
      }));


    return result;
  }

  /**
   * Aggregate service calls for Brand page.
   *
   * @param {String} domain
   * @param {String} uri
   * @param {Object} attributes
   *
   * @return {Array}
   */
  _aggregatedCall(domain, uri, attributes) {
    const breadCrumb = this.breadCrumb.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const category = this.category.setDomain(domain);
    const brand = _.get(attributes, 'brand.brand_name') || '';
    const widgetsKey = `${this.prefix}${this.pageType}`;
    const options = { brand };

    return [
      widgets.getByPage(_.get(this.widgetsConfig, widgetsKey, '')).catch(compositeErrorHandler),
      breadCrumb.getByPage(_.get(this.breadcrumbConfig, this.pageType, ''), options).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      meta.getByPage(_.get(this.metasConfig, this.pageType, ''), options).catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
    ];
  }
}
