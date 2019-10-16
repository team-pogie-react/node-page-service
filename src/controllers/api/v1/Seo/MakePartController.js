import { _, merge } from 'lodash';
import { compositeErrorHandler } from '../../../../errors/handlers';
import { convertToUNBXDFormat, encode } from '../../../../core/helpers';
import BaseController from '../../BaseController';
import Meta from '../../../../services/Meta';
import Seo from '../../../../services/Seo';
import Vehicles from '../../../../services/Vehicle';
import StrapiWidget from '../../../../services/widgets/StrapiWidget';
import Breadcrumb from '../../../../services/Breadcrumb';
import Catalog from '../../../../services/Catalog';
import Category from '../../../../services/Category';
import Products from '../../../../services/Products';
import Videos from '../../../../services/Videos';
import Headings from '../../../../services/Headings';
import StructuredData from '../../../../services/StructuredData';
import Breadcrumbs from '../../../../configs/services/breadcrumbs';
import Metas from '../../../../configs/services/metas';
import Widgets from '../../../../configs/services/widgets';
import VideosConfig from '../../../../configs/services/videos';

export default class MakePartController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.vehicles = new Vehicles();
    this.widgets = new StrapiWidget();
    this.meta = new Meta();
    this.breadcrumb = new Breadcrumb();
    this.catalog = new Catalog();
    this.category = new Category();
    this.products = new Products();
    this.videos = new Videos();
    this.headings = new Headings();
    this.seo = new Seo();
    this.structuredData = new StructuredData();
  }

  /**
   * Get data for make part.
   *
   * @param {Object} request
   * @param {String} domain
   * @param {Object} page
   *
   * @returns {Object<Promise>}
   */
  async index(request, domain, page) {
    const { query } = request;
    const result = await Promise.all(this._aggregatedCall(
      domain, query, page,
    ))
      .then(([
        meta,
        widgets,
        years,
        breadcrumbs,
        products,
        navigationCategories,
        shopByModels,
        videos,
        headers,
        ratings,
      ]) => Promise.resolve({
        articles: page.articles,
        breadcrumbs,
        header: _.get(headers, 'page', null),
        headings: {
          products: this.headings.products(page.attributes),
          articles: this.headings.articles(page.articles.header),
          shopByModels: this.headings.products(page.attributes),
          videos: VideosConfig.heading,
        },
        meta,
        navigationCategories,
        products,
        shopByModels,
        videos,
        widgets,
        years,
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
   * Aggregate service calls for seo make part page.
   *
   * @param {String} domain
   * @param {Object} query
   * @param {Object} page
   *
   * @return {Array}
   */
  _aggregatedCall(domain, query, page) {
    const attributes = _.get(page, 'attributes');
    const pageType = _.get(page, 'page_type');
    const paramQuery = query;
    const vehicles = this.vehicles.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const breadcrumb = this.breadcrumb.setDomain(domain);
    const category = this.category.setDomain(domain);
    const products = this.products.setDomain(domain);
    const structuredData = this.structuredData.setDomain(domain);
    const seo = this.seo.setDomain(domain);
    const headings = this.headings.setDomain(domain);
    const { videos } = this;

    paramQuery.filters = _.merge({ universal: false }, paramQuery.filters);
    const unbxdParams = convertToUNBXDFormat(attributes, paramQuery);

    unbxdParams.seo = 'true';
    _.unset(unbxdParams, 'vehicle');
    _.set(unbxdParams, 'vehicle.make', encode(attributes.make.make_name));
    const productSearchPromise = products.search(unbxdParams);
    const ratingPromise = productSearchPromise.then((productList) => {
      if (!_.has(productList, 'productIds')) {
        return null;
      }

      const productIds = merge([], productList.productIds);

      return structuredData.getRatings(productIds);
    });

    const pageAttr = _.merge({}, attributes);
    const headingParams = {
      part: pageAttr.part.part_name || '',
      make: pageAttr.make.make_name || '',
    };
    const requestAttr = {
      ...headingParams,
      prm1: pageAttr.part.part || '',
      prm2: pageAttr.make.make || '',
    };

    const displayNode = ['model', 'part'];
    const encodedAttr = pageAttr;
    encodedAttr.part.part_name = encodeURIComponent(encodedAttr.part.part_name);
    encodedAttr.make.make_name = encodeURIComponent(encodedAttr.make.make_name);

    return [
      meta.getByPage(Metas.MAKE_PART, requestAttr).catch(compositeErrorHandler),
      widgets.getByPage(Widgets.SEO_MAKE_PART).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      breadcrumb.getByPage(Breadcrumbs.MAKE_PART, requestAttr).catch(compositeErrorHandler),
      productSearchPromise.catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
      seo.getShopByModels(encodedAttr, displayNode).catch(compositeErrorHandler),
      videos.getCommon().catch(compositeErrorHandler),
      headings.getPageHeader(pageType, headingParams).catch(compositeErrorHandler),
      ratingPromise.catch(compositeErrorHandler),
    ];
  }
}
