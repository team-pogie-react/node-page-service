import { _, merge } from 'lodash';
import { convertToUNBXDFormat } from '../../../../core/helpers';
import { compositeErrorHandler } from '../../../../errors/handlers';
import BaseController from '../../BaseController';
import Vehicle from '../../../../services/Vehicle';
import Catalog from '../../../../services/Catalog';
import Widgets from '../../../../services/widgets/StrapiWidget';
import Breadcrumb from '../../../../services/Breadcrumb';
import Meta from '../../../../services/Meta';
import Category from '../../../../services/Category';
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

export default class BrandPartController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.vehicles = new Vehicle();
    this.catalog = new Catalog();
    this.meta = new Meta();
    this.widgets = new Widgets();
    this.breadcrumbs = new Breadcrumb();
    this.seoFormatter = new SeoFormatter();
    this.category = new Category();
    this.products = new Products();
    this.videos = new Videos();
    this.headings = new Headings();
    this.breadcrumbConfig = BreadcrumbConfig || {};
    this.metasConfig = MetasConfig || {};
    this.widgetsConfig = WidgetsConfig || {};
    this.pageType = 'BRAND_PART';
    this.prefix = 'SEO_';
    this.structuredData = new StructuredData();
    this.vlpTransformer = new VLPTransformer();
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
    const { query } = request;
    const pageData = _.get(page, 'articles') || {};

    const result = await Promise.all(
      this._aggregatedCall(domain, query, page),
    )
      .then(([
        widgetsResponse,
        breadCrumbsResponse,
        shopByBrands,
        productsResponse,
        yearsReponse,
        metaResponse,
        navigationCategoriesResponse,
        videos,
        headers,
        ratings,
      ]) => Promise.resolve({
        articles: pageData,
        breadcrumbs: breadCrumbsResponse,
        header: _.get(headers, 'page', null),
        headings: {
          products: this.headings.products(page.attributes),
          articles: this.headings.articles(page.articles.header),
          shopByBrands: this.headings.products(page.attributes),
          videos: VideosConfig.heading,
        },
        meta: metaResponse,
        navigationCategories: navigationCategoriesResponse,
        pageType: page.page_type,
        products: productsResponse,
        shopByBrands,
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
   * Aggregate service calls for Brand Part page.
   *
   * @param {String} domain
   * @param {Object} query
   * @param {Object} page
   *
   * @return {Array}
   */
  _aggregatedCall(domain, query, page) {
    const self = this;
    const attributes = _.get(page, 'attributes');
    const pageType = _.get(page, 'page_type');
    const catalog = this.catalog.setDomain(domain);
    const category = this.category.setDomain(domain);
    const breadCrumb = this.breadcrumbs.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const products = this.products.setDomain(domain);
    const headings = this.headings.setDomain(domain);
    const structuredData = this.structuredData.setDomain(domain);
    const { videos } = this;
    const widgetsKey = `${this.prefix}${this.pageType}`;

    const part = _.get(attributes, 'part.part_name') || '';
    const brand = _.get(attributes, 'brand.brand_name') || '';
    const params = { brand, part };

    const unbxdParams = convertToUNBXDFormat(attributes, query);
    unbxdParams.seo = 'true';
    const productSearchPromise = products.search(unbxdParams);

    const relatedBrandsParrams = { part };
    let newParams = _.merge({}, relatedBrandsParrams);

    if ('vehicle' in query) {
      newParams = _.merge(newParams, query.vehicle);
    }

    const ratingPromise = productSearchPromise.then((productList) => {
      if (!_.has(productList, 'productIds')) {
        return null;
      }

      const productIds = merge([], productList.productIds);

      return structuredData.getRatings(productIds);
    });

    return [
      widgets.getByPage(_.get(self.widgetsConfig, widgetsKey, '')).catch(compositeErrorHandler),
      breadCrumb.getByPage(_.get(self.breadcrumbConfig, this.pageType, ''), params)
        .catch(compositeErrorHandler),
      catalog.getRelatedBrands(newParams, relatedBrandsParrams).catch(compositeErrorHandler),
      productSearchPromise.catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      meta.getByPage(_.get(self.metasConfig, this.pageType, ''), params).catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
      videos.getCommon().catch(compositeErrorHandler),
      headings.getPageHeader(pageType, params).catch(compositeErrorHandler),
      ratingPromise.catch(compositeErrorHandler),
    ];
  }
}
