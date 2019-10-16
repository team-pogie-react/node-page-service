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
import VideosConfig from '../../../../configs/services/videos';
import BreadcrumbConfig from '../../../../configs/services/breadcrumbs';
import Metas from '../../../../configs/services/metas';

export default class MakeModelController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.widgets = new Widgets();
    this.vehicles = new Vehicle();
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
        shopByYears,
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
          products: this.headings.products(page.attributes),
          articles: this.headings.articles(page.articles.header),
          shopByYears: this.headings.topParts(get(headers, 'page', null)),
          videos: VideosConfig.heading,
        },
        meta,
        navigationCategories,
        products,
        shopByYears,
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
   * Aggregate service calls for Make model part page.
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
    const queryParams = merge({}, paramQuery.vehicle);
    const vehicles = this.vehicles.setDomain(domain);
    const pageAttributes = merge({}, attributes);
    const widgets = this.widgets.setDomain(domain);
    const breadCrumb = this.breadCrumb.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const structuredData = this.structuredData.setDomain(domain);
    const { videos } = this;
    const category = this.category.setDomain(domain);
    const products = this.products.setDomain(domain);
    const seo = this.seo.setDomain(domain);
    const headings = this.headings.setDomain(domain);

    const requestDataAttribute = {
      prm1: pageAttributes.part.part,
      prm2: pageAttributes.make.make,
      prm3: pageAttributes.model.model,
      part: pageAttributes.part.part_name,
      make: pageAttributes.make.make_name,
      model: pageAttributes.model.model_name,
    };

    const encodedMake = encodeURIComponent(pageAttributes.make.make_name);
    const encodedModel = encodeURIComponent(pageAttributes.model.model_name);
    const encodedPart = encodeURIComponent(pageAttributes.part.part_name);
    pageAttributes.make.make_name = encodedMake;
    pageAttributes.model.model_name = encodedModel;
    pageAttributes.part.part_name = encodedPart;

    const params = {
      make: pageAttributes.make.make_name,
      model: pageAttributes.model.model_name,
      part: pageAttributes.part.part_name,
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
      widgets.getByPage('seo_mmp').catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      seo.getSeoYear(pageAttributes, queryParams).catch(compositeErrorHandler),
      breadCrumb.getByPage(BreadcrumbConfig.MAKE_MODEL_PART, params)
        .catch(compositeErrorHandler),
      productSearchPromise.catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
      meta.getByPage(Metas.MAKE_MODEL_PART, requestDataAttribute).catch(compositeErrorHandler),
      videos.getCommon().catch(compositeErrorHandler),
      headings.getPageHeader(pageType, params).catch(compositeErrorHandler),
      ratingPromise.catch(compositeErrorHandler),
    ];
  }
}
