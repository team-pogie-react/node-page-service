import { _, merge } from 'lodash';
import Promise from 'bluebird';
import { REQUEST_TIMEOUT } from 'http-status-codes';

import Category from '../../../services/Category';
import Content from '../../../services/Content';
import Page from '../../../services/Page';
import Seo from '../../../services/Seo';
import Vehicle from '../../../services/Vehicle';
import StrapiWidget from '../../../services/widgets/StrapiWidget';

import BaseController from '../BaseController';
import BrandController from './Seo/BrandController';
import BrandPartController from './Seo/BrandPartController';
import CategoryController from './Seo/CategoryController';
import MakeModelController from './Seo/MakeModelController';
import MakeController from './Seo/MakeController';
import MakeModelPartController from './Seo/MakeModelPartController';
import MakePartController from './Seo/MakePartController';
import YearMakeModelPartController from './Seo/YearMakeModelPartController';
import PageNotFound from './PagenotfoundController';
import PageRedirect from './PageredirectController';
import PartController from './Seo/PartController';
import NonStandardController from './Seo/NonStandardController';
import PdpController from './Seo/PdpController';

import { compositeErrorHandler } from '../../../errors/handlers';
import Config from '../../../configs/services/pages';
import WIDGETS from '../../../configs/services/widgets';
import Videos from '../../../services/Videos';
import Meta from '../../../services/Meta';
import StructuredData from '../../../services/StructuredData';
import MetasConfig from '../../../configs/services/metas';
import pdpPageTypes from '../../../configs/services/pdp';

import Blog from '../../../services/Blog';
import Rating from '../../../services/Rating';
import constant from '../../../configs/constant';

export default class PageTypeController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    this.config = Config || {};
    this.seo = new Seo();
    this.metas = new Meta();
    this.categories = new Category();
    this.vehicles = new Vehicle();
    this.contents = new Content();
    this.widgets = new StrapiWidget();
    this.blog = new Blog();
    this.page = new Page();
    this.videos = new Videos();
    this.pageNotFound = new PageNotFound();
    this.pageRedirect = new PageRedirect();
    this.BrandController = new BrandController();
    this.MakeController = new MakeController();
    this.PartController = new PartController();
    this.MakeModelController = new MakeModelController();
    this.YearMakeModelPartController = new YearMakeModelPartController();
    this.BrandPartController = new BrandPartController();
    this.MakeModelPartController = new MakeModelPartController();
    this.MakePartController = new MakePartController();
    this.CategoryController = new CategoryController();
    this.NonStandardController = new NonStandardController();
    this.PdpController = new PdpController();
    this.ratings = new Rating();
    this.structuredData = new StructuredData();
  }

  /**
   * Construct a class mapping based from the request uri submitted.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @return {Array<Object>}
   */
  async route(request, response) {
    const self = this;
    try {
      const domain = self.getDomain(request);
      const uri = _.get(request, 'query.uri', '');
      const tid = _.get(request, 'query.TID', _.get(request, 'query.tid'));

      if (_.isEmpty(uri)) {
        return response.withError('Missing URI parameter', 400);
      }

      let page = {};
      let result = {};

      page = await self._getPageTypeData(domain, uri, tid);

      const responseCode = page.status_code || page.status || 404;
console.log('responseCode',responseCode)
      switch (responseCode) {
        case '301':
        case 301:
          _.set(response, 'page', page);
          _.set(page, 'page_type', 'page_redirect');
          break;
        case '404':
        case 404:
          _.set(page, 'page_type', 'page_notfound');
          break;
        case '200':
        case 200:
        default:
      }

      let pageType = _.get(page, 'page_type', '');


      switch (pageType) {
        case 'category':
          result = await self.CategoryController.index(request, domain, page);
          pageType = this._determineCategoryLevel(page); // Override Page Type for Category only
          break;
        case 'make':
          result = await self.MakeController.index(request, domain, page);
          break;
        case 'brand':
          result = await self.BrandController.index(request, domain, page);
          break;
        case 'part':
          result = await self.PartController.index(request, domain, page);
          break;
        case 'make_part':
          result = await self.MakePartController.index(request, domain, page);
          break;
        case 'brand_part':
          result = await self.BrandPartController.index(request, domain, page);
          break;
        case 'make_model':
          result = await self.MakeModelController.index(request, domain, page);
          break;
        case 'make_model_part':
          result = await self.MakeModelPartController.index(request, domain, page);
          break;
        case 'year_make_model_part':
          result = await self.YearMakeModelPartController.index(request, domain, page);
          break;
        case 'nonstandard':
          result = await self.NonStandardController.index(request, domain, page);
          break;
        case 'sku':
        case 'univ_sku':
        case 'ymm_bp_sku':
        case 'mm_bp_sku':
        case 'mm_yb_sku':
        case 'ymm_sku':
        case 'ymms_sku':
        case 'ymmse_sku':
        case 'ymms_pla_sku':
        case 'sku_pla':
        case 'univ_sku_pla':
        case 'ymm_bp_sku_pla':
        case 'mm_bp_sku_pla':
        case 'mm_yb_sku_pla':
        case 'ymm_sku_pla':
        case 'ymms_sku_pla':
        case 'ymmse_sku_pla':
        case 'ymms_pla_sku_pla':
          result = await self.PdpController.index(request, domain, page);
          _.set(page, 'articles.data', result.blogs);
          _.unset(result, 'blogs');
          break;
        case 'page_notfound':
          return response.withData(await self.pageNotFound.index(request, response));
        case 'page_redirect':
          return response.withData(self.pageRedirect.index(request, response));
        default:
          console.log('pageType',pageType);
          return response.withError('Unknown page type.', 500);
      }

      _.set(result, 'selectedAttributes', this._getSelectedAttributes(page.attributes, request.query));
      _.set(result, 'headings.page', _.get(result, 'header', ''));
      _.set(result, 'pageType', _.get(self.config, pageType, ''));
      _.set(result, 'articles', _.get(page, 'articles', {}));

      if (this._addCanonicalUri(result, request.query, tid)) {
        _.set(result, 'canonicalUri', uri);
      }

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Format attribute to retrieve the correct value for each attribute
   *
   * @param {Object} attributes
   *
   * @return {Object}
   */
  _getSelectedAttributes(attributes, queryParams) {
    const selectedAttributes = {};
    const vehicleParams = merge({}, queryParams.vehicle);

    if ('make' in attributes || 'make' in vehicleParams) {
      selectedAttributes.make = _.get(attributes, 'make.make_name',
        _.get(attributes, 'make.makeName',
          _.get(vehicleParams, 'make', '')));
    }

    if ('model' in attributes || 'model' in vehicleParams) {
      selectedAttributes.model = _.get(attributes, 'model.model_name',
        _.get(attributes, 'model.modelName',
          _.get(vehicleParams, 'model', '')));
    }

    if ('year' in attributes || 'year' in vehicleParams) {
      selectedAttributes.year = _.get(attributes, 'year.year',
        _.get(vehicleParams, 'year', ''));
    }

    if ('brand' in attributes || 'brand' in vehicleParams) {
      selectedAttributes.brand = _.get(attributes, 'brand.brand_name',
        _.get(attributes, 'brand.brandName',
          _.get(vehicleParams, 'brand', '')));
    }

    if ('sku' in attributes) {
      selectedAttributes.sku = _.get(attributes, 'sku.sku', '');
    }

    return selectedAttributes;
  }

  /**
   * Aggregate service calls for home page.
   *
   * @param {String} domain
   * @param {String} uri
   * @param {String} tid
   *
   * @return {Promise<Object>}
   */
  _getPageTypeData(domain, uri, tid) {
    return new Promise((resolve, reject) => {
      this.page.setDomain(domain).getData(uri, tid)
        .then(data => resolve(data))
        .catch((error) => {
          if (error.status === REQUEST_TIMEOUT) {
            return reject(error);
          }

          return resolve(error);
        });
    });
  }

  /**
   * Aggregate api responses for home page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async home(request, response) {
    try {
      const domain = this.getDomain(request);
      const result = await Promise.all(this._aggregatedHome(domain))
        .then(([
          meta,
          widgets,
          shopByCategories,
          years,
          navigationCategories,
          staticData,
          videos,
          blogs,
          reseller,
        ]) => Promise.resolve({
          meta,
          widgets,
          shopByCategories: this._arrangeCategories(shopByCategories, staticData.categoryOrders),
          shopByTopBrands: staticData.shopByTopBrands,
          shopByPopularParts: staticData.shopByPopularParts,
          featuredMakes: _.orderBy(staticData.featuredMakes, ['text'], ['asc']),
          popularSearches: staticData.popularSearches,
          years,
          navigationCategories,
          videos,
          blogs,
          reseller,
          pageType: constant.PAGETYPE.home,
          canonicalUri: '/',
          structuredData: this.structuredData.generate({
            Organization: widgets,
          }),
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status);
    }
  }

  _arrangeCategories(categories, categoryList) {
    const newDataCategory = [];
    _.forEach(categoryList, (list) => {
      _.forEach(categories, (data) => {
        const categoryData = data;
        if (categoryData.text === list) {
          newDataCategory.push(categoryData);
        }
      });
    });

    return newDataCategory;
  }

  /**
   * Aggregate service calls for home page.
   *
   * @param {String} domain
   *
   * @return {Array}
   */
  _aggregatedHome(domain) {
    const maxResult = 8;
    const maxBlogPosts = 3;
    const seo = this.seo.setDomain(domain);
    const categories = this.categories.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const metas = this.metas.setDomain(domain);

    return [
      metas.getByPage(MetasConfig.HOME).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.HOME_PAGE).catch(compositeErrorHandler),
      categories.getHomeCategory(maxResult).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      seo.getStaticDataContent().catch(compositeErrorHandler),
      this.videos.getCommon().catch(compositeErrorHandler),
      this.blog.getPosts(maxBlogPosts).catch(compositeErrorHandler),
      this.ratings.setDomain(domain).getResellerInfo().catch(compositeErrorHandler),
    ];
  }

  _determineCategoryLevel(page) {
    const { cat } = page.attributes;
    if (typeof cat !== 'undefined') {
      return 'second_level_category';
    }

    return 'first_level_category';
  }

  /**
   * Checks if canonicalUri node is to be added
   *
   * @param {Object} result
   * @param {Object} query
   * @param {String} tid
   *
   * @returns Boolean
   */

  _addCanonicalUri(result, query, tid) {
    const { canonicalUri, pageType } = result;
    const { vehicle, uri } = query;
    const isPdp = pdpPageTypes.indexOf(pageType) !== -1;

    return canonicalUri === undefined
      && (!isPdp || (isPdp
        && (vehicle !== undefined || uri.split('/').length < 5)
        && tid === undefined));
  }
}
