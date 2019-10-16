import { _, merge } from 'lodash';
import { compositeErrorHandler } from '../../../../errors/handlers';
import { convertToUNBXDFormat } from '../../../../core/helpers';
import BaseController from '../../BaseController';
import Breadcrumb from '../../../../services/Breadcrumb';
import Catalog from '../../../../services/Catalog';
import Meta from '../../../../services/Meta';
import Vehicle from '../../../../services/Vehicle';
import Category from '../../../../services/Category';
import Widgets from '../../../../services/widgets/StrapiWidget';
import SeoFormatter from '../../../../core/library/seo/url/formatter';
import Products from '../../../../services/Products';
import Videos from '../../../../services/Videos';
import Headings from '../../../../services/Headings';
import StructuredData from '../../../../services/StructuredData';
import VideosConfig from '../../../../configs/services/videos';
import BreadcrumbConfig from '../../../../configs/services/breadcrumbs';
import MetasConfig from '../../../../configs/services/metas';
import WidgetsConfig from '../../../../configs/services/widgets';
import VLPTransformer from '../../../../transformers/VLPTransformer';

export default class BrandController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.vehicles = new Vehicle();
    this.catalog = new Catalog();
    this.widgets = new Widgets();
    this.breadCrumb = new Breadcrumb();
    this.seoFormatter = new SeoFormatter();
    this.meta = new Meta();
    this.category = new Category();
    this.products = new Products();
    this.videos = new Videos();
    this.headings = new Headings();
    this.breadcrumbConfig = BreadcrumbConfig || {};
    this.metasConfig = MetasConfig || {};
    this.widgetsConfig = WidgetsConfig || {};
    this.pageType = 'BRAND';
    this.prefix = 'SEO_';
    this.structuredData = new StructuredData();
    this.vlpTransformer = new VLPTransformer();
    this.headings = new Headings();
  }

  /**
   * Get brand
   *
   * @param {Object} request
   * @param {String} domain
   * @param {String} page
   *
   * @returns {Object<Promise>}
   */
  async index(request, domain, page) {
    const { query } = request;
    const pageData = _.get(page, 'articles') || {};

    const result = await Promise.all(
      this._aggregatedCall(domain, query, page),
    )
      .then(([
        widgetsResponse,
        breadCrumbsResponse,
        productsResponse,
        yearsReponse,
        metasResponse,
        shopByParts,
        navigationCategoriesResponse,
        videos,
        headers,
        ratings,
      ]) => Promise.resolve({
        articles: pageData,
        breadcrumbs: breadCrumbsResponse,
        header: _.get(headers, 'page', null),
        headings: {
          products: this.headings.products(page.attributes, 'Parts'),
          articles: this.headings.articles(page.articles.header),
          shopByParts: this.headings.products(page.attributes),
          videos: VideosConfig.heading,
        },
        meta: metasResponse,
        navigationCategories: navigationCategoriesResponse,
        pageType: _.get(page, 'page_type'),
        products: productsResponse,
        shopByParts,
        videos,
        widgets: widgetsResponse,
        years: yearsReponse,
        ratings,
      }));

    if ('error' in result.products && result.products.error.status === 404) {
      result.redirectUri = this.vlpTransformer.convertToVLPFormat(query.vehicle);
    }

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
   * Aggregate service calls for Brand page.
   *
   * @param {String} domain
   * @param {String} uri
   * @param {Object} page
   *
   * @return {Array}
   */
  _aggregatedCall(domain, query, page) {
    const attributes = _.get(page, 'attributes');
    const pageType = _.get(page, 'page_type');
    const breadCrumb = this.breadCrumb.setDomain(domain);
    const catalog = this.catalog.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const category = this.category.setDomain(domain);
    const products = this.products.setDomain(domain);
    const headings = this.headings.setDomain(domain);
    const structuredData = this.structuredData.setDomain(domain);
    const { videos } = this;
    const widgetsKey = `${this.prefix}${this.pageType}`;
    const brand = _.get(attributes, 'brand.brand_name') || '';
    const options = { brand };
    const unbxdParams = convertToUNBXDFormat(attributes, query);
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
      widgets.getByPage(_.get(this.widgetsConfig, widgetsKey, '')).catch(compositeErrorHandler),
      breadCrumb.getByPage(_.get(this.breadcrumbConfig, this.pageType, ''), options)
        .catch(compositeErrorHandler),
      productSearchPromise.catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      meta.getByPage(_.get(this.metasConfig, this.pageType, ''), options).catch(compositeErrorHandler),
      catalog.getShopByParts(options).catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
      videos.getCommon().catch(compositeErrorHandler),
      headings.getPageHeader(pageType, options).catch(compositeErrorHandler),
      ratingPromise.catch(compositeErrorHandler),
    ];
  }
}
