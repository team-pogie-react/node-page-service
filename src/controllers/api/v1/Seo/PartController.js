import { _, merge, get } from 'lodash';
import { compositeErrorHandler } from '../../../../errors/handlers';
import { convertToUNBXDFormat } from '../../../../core/helpers';
import BaseController from '../../BaseController';
import Seo from '../../../../services/Seo';
import Vehicle from '../../../../services/Vehicle';
import StrapiWidget from '../../../../services/widgets/StrapiWidget';
import Catalog from '../../../../services/Catalog';
import Breadcrumb from '../../../../services/Breadcrumb';
import Meta from '../../../../services/Meta';
import Category from '../../../../services/Category';
import Products from '../../../../services/Products';
import Videos from '../../../../services/Videos';
import Headings from '../../../../services/Headings';
import StructuredData from '../../../../services/StructuredData';
import VideosConfig from '../../../../configs/services/videos';
import Breadcrumbs from '../../../../configs/services/breadcrumbs';
import Metas from '../../../../configs/services/metas';
import Widgets from '../../../../configs/services/widgets';
import VLPTransformer from '../../../../transformers/VLPTransformer';

export default class PartController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.vehicles = new Vehicle();
    this.widgets = new StrapiWidget();
    this.catalog = new Catalog();
    this.breadcrumbs = new Breadcrumb();
    this.meta = new Meta();
    this.category = new Category();
    this.products = new Products();
    this.videos = new Videos();
    this.headings = new Headings();
    this.seo = new Seo();
    this.structuredData = new StructuredData();
    this.vlpTransformer = new VLPTransformer();
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
    const result = await Promise.all(this._aggregatedCall(domain, query, page))
      .then(([
        years,
        products,
        shopByBrands,
        shopByMakes,
        widgets,
        meta,
        breadcrumbs,
        navigationCategories,
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
          shopByBrands: this.headings.products(page.attributes, 'by Brand'), // this will just return the header value
          shopByMakes: this.headings.products(page.attributes, 'by Make'),
          videos: VideosConfig.heading,
        },
        meta,
        navigationCategories,
        products,
        shopByBrands,
        shopByMakes,
        videos,
        widgets,
        years,
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
   * Aggregate service calls for Part page.
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
    const vehicles = this.vehicles.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const catalog = this.catalog.setDomain(domain);
    const breadcrumbs = this.breadcrumbs.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const category = this.category.setDomain(domain);
    const headings = this.headings.setDomain(domain);
    const structuredData = this.structuredData.setDomain(domain);
    const { videos } = this;
    const products = this.products.setDomain(domain);
    const pageAttributes = merge({}, attributes);

    pageAttributes.part.part_name = encodeURIComponent(pageAttributes.part.part_name);

    let newParams = {
      part: attributes.part.part_name,
    };

    const params = {
      part: attributes.part.part_name,
    };

    if ('vehicle' in query) {
      newParams = merge(newParams, query.vehicle);
    }

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
      vehicles.years().catch(compositeErrorHandler),
      productSearchPromise.catch(compositeErrorHandler),
      catalog.getRelatedBrands(newParams, params).catch(compositeErrorHandler),
      catalog.getBrandPartMake(params).catch(compositeErrorHandler),
      widgets.getByPage(Widgets.SEO_PART).catch(compositeErrorHandler),
      meta.getByPage(Metas.PART, params).catch(compositeErrorHandler),
      breadcrumbs.getByPage(Breadcrumbs.PART, params).catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
      videos.getCommon().catch(compositeErrorHandler),
      headings.getPageHeader(pageType, params).catch(compositeErrorHandler),
      ratingPromise.catch(compositeErrorHandler),
    ];
  }
}
