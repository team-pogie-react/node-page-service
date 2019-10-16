import { _, merge, get } from 'lodash';
import { compositeErrorHandler } from '../../../../errors/handlers';
import { convertToUNBXDFormat } from '../../../../core/helpers';
import BaseController from '../../BaseController';
import Seo from '../../../../services/Seo';
import Vehicle from '../../../../services/Vehicle';
import Widgets from '../../../../services/widgets/StrapiWidget';
import BreadCrumb from '../../../../services/Breadcrumb';
import Meta from '../../../../services/Meta';
import Category from '../../../../services/Category';
import Products from '../../../../services/Products';
import Videos from '../../../../services/Videos';
import Headings from '../../../../services/Headings';
import StructuredData from '../../../../services/StructuredData';
import WidgetConfig from '../../../../configs/services/widgets';
import BreadcrumbConfig from '../../../../configs/services/breadcrumbs';
import Metas from '../../../../configs/services/metas';
import VideosConfig from '../../../../configs/services/videos';

export default class MakeModelController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.vehicles = new Vehicle();
    this.widgets = new Widgets();
    this.breadCrumb = new BreadCrumb();
    this.meta = new Meta();
    this.category = new Category();
    this.products = new Products();
    this.videos = new Videos();
    this.headings = new Headings();
    this.seo = new Seo();
    this.structuredData = new StructuredData();
  }

  /**
   * Get models for specific makes.
   *
   * @param {Object} request
   * @param {String} domain
   * @param {String} page
   *
   * @returns {Object<Promise>}
   */
  async index(request, domain, page) {
    const { query } = request;

    const result = await Promise.all(
      this._aggregatedCall(domain, query, page),
    )
      .then(([
        widgets,
        years,
        topParts,
        breadcrumbs,
        products,
        navigationCategories,
        meta,
        videos,
        headers,
        ratings,
      ]) => Promise.resolve({
        articles: page.articles,
        breadcrumbs,
        header: get(headers, 'page', null),
        headings: {
          products: this.headings.products(page.attributes, 'Parts'),
          articles: this.headings.articles(page.articles.header),
          topParts: this.headings.topParts(get(headers, 'page', null)), // this will just return the header value
          videos: VideosConfig.heading,
        },
        meta,
        navigationCategories,
        products,
        topParts,
        widgets,
        years,
        videos,
        ratings,
      }));

    const structuredData = this.structuredData.generate({
      BreadcrumbList: result.breadcrumbs,
      Product: result.products.items,
      _ratings: result.ratings,
      _meta: result.meta,
    });

    _.unset(result, 'ratings');
    result.structuredData = structuredData;

    return result;
  }


  /**
   * Aggregate service calls for make model page.
   *
   * @param {String} domain
   * @param {Object} query
   * @param {Object} page
   *
   * @return {Array}
   */
  _aggregatedCall(domain, query, page) {
    const attributes = get(page, 'attributes');
    const pageType = get(page, 'page_type');
    const paramQuery = query;
    const breadCrumb = this.breadCrumb.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const structuredData = this.structuredData.setDomain(domain);
    const { videos } = this;
    const category = this.category.setDomain(domain);
    const products = this.products.setDomain(domain);
    const seo = this.seo.setDomain(domain);
    const headings = this.headings.setDomain(domain);
    const pageAttributes = merge({}, attributes);

    const requestDataAttribute = {
      prm1: pageAttributes.make.make,
      prm2: pageAttributes.model.model,
      make: pageAttributes.make.make_name,
      model: pageAttributes.model.model_name,
    };
    const params = {
      make: pageAttributes.make.make_name,
      model: pageAttributes.model.model_name,
    };

    delete paramQuery.vehicle;
    paramQuery.filters = merge({ universal: false }, paramQuery.filters);
    const unbxdParams = convertToUNBXDFormat(attributes, paramQuery);
    unbxdParams.seo = 'true';
    const productSearchPromise = products.search(unbxdParams);
    const ratingPromise = productSearchPromise.then((productList) => {
      if (!_.has(productList, 'productIds')) {
        return null;
      }

      const productIds = merge([], productList.productIds);

      return structuredData.getRatings(productIds);
    });

    return [
      widgets.getByPage(WidgetConfig.SEO_MAKE_MODEL).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      seo.sortedTopParts(attributes).catch(compositeErrorHandler),
      breadCrumb.getByPage(BreadcrumbConfig.MAKE_MODEL, params)
        .catch(compositeErrorHandler),
      productSearchPromise.catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
      meta.getByPage(Metas.MAKE_MODEL, requestDataAttribute).catch(compositeErrorHandler),
      videos.getCommon().catch(compositeErrorHandler),
      headings.getPageHeader(pageType, params).catch(compositeErrorHandler),
      ratingPromise.catch(compositeErrorHandler),
    ];
  }
}
