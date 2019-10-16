import { _ } from 'lodash';
import Promise from 'bluebird';
import BaseController from '../../BaseController';
import StrapiWidget from '../../../../services/widgets/StrapiWidget';
import PageNotFound from '../PagenotfoundController';
import PageRedirect from '../PageredirectController';
import Breadcrumb from '../../../../services/Breadcrumb';
import Meta from '../../../../services/Meta';
import Catalog from '../../../../services/Catalog';
import Vehicle from '../../../../services/Vehicle';
import Category from '../../../../services/Category';
import Products from '../../../../services/Products';
import Videos from '../../../../services/Videos';
import Blog from '../../../../services/Blog';
import StructuredData from '../../../../services/StructuredData';
import Headings from '../../../../services/Headings';
import { compositeErrorHandler } from '../../../../errors/handlers';
import BreadcrumbConfig from '../../../../configs/services/breadcrumbs';
import MetaConfig from '../../../../configs/services/metas';
import WidgetsConfig from '../../../../configs/services/widgets';
import PagesConfig from '../../../../configs/services/pages';
import { decode, isFalsy } from '../../../../core/helpers';

export default class PdpController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.pageNotFound = new PageNotFound();
    this.pageRedirect = new PageRedirect();
    this.breadcrumb = new Breadcrumb();
    this.meta = new Meta();
    this.category = new Category();
    this.vehicle = new Vehicle();
    this.widgets = new StrapiWidget();
    this.catalog = new Catalog();
    this.products = new Products();
    this.videos = new Videos();
    this.blog = new Blog();
    this.structuredData = new StructuredData();
    this.headings = new Headings();
  }

  /**
   * Get response data for product details page
   *
   * @param {Object} request
   * @param {String} domain
   * @param {Object} pageAttr
   */
  async index(request, domain, pageAttr) {
    const result = await Promise.all(this._aggregatedCall(domain, pageAttr, request))
      .then(([
        years,
        breadcrumbs,
        meta,
        navigationCategories,
        widgets,
        productDetails,
        vehicleFitments,
        videos,
        blogs,
        headers,
        ratings,
      ]) => Promise.resolve({
        breadcrumbs,
        blogs,
        header: _.get(headers, 'page', null),
        meta,
        navigationCategories,
        productDetails: {
          ...productDetails,
          page: _.get(pageAttr, 'page_type', null),
          attributes: this._getAttr(pageAttr),
        },
        ratings,
        vehicleFitments,
        videos,
        widgets,
        years,
      }));

    const structuredData = this.structuredData.generate({
      BreadcrumbList: result.breadcrumbs,
      Product: result.productDetails,
      _ratings: _.get(result, 'ratings', null),
      _meta: result.meta,
      _complete: true,
    });

    _.unset(result, 'ratings');
    result.structuredData = structuredData;

    return result;
  }

  /**
   * Aggregate service calls for product detail page.
   *
   * @param {String} domain
   * @param {Object} pageAttr
   * @param {Object} request
   */
  _aggregatedCall(domain, pageAttr, request) {
    const vehicle = this.vehicle.setDomain(domain);
    const breadcrumb = this.breadcrumb.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const category = this.category.setDomain(domain);
    const catalog = this.catalog.setDomain(domain);
    const products = this.products.setDomain(domain);
    const videos = this.videos.setDomain(domain);
    const headings = this.headings.setDomain(domain);
    const structuredData = this.structuredData.setDomain(domain);
    const sku = _.get(pageAttr, 'attributes.sku.sku', null);
    const searchParams = this._getSearchParams(request, pageAttr);
    const isPla = !isFalsy(request.query.TID) || !isFalsy(request.query.tid);
    const productPromise = products.details(searchParams, isPla);

    const headerParams = {
      part: _.get(pageAttr, 'attributes.part.part_name'),
      brand: _.get(pageAttr, 'attributes.brand.brand_name'),
      sku: _.get(pageAttr, 'attributes.sku.sku'),
    };

    const requestParams = {
      brand: _.get(pageAttr, 'attributes.brand.brand_name', null),
      part: _.get(pageAttr, 'attributes.part.part_name', null),
      make: _.get(pageAttr, 'attributes.make.make_name', null),
      model: _.get(pageAttr, 'attributes.model.model_name', null),
      year: _.get(pageAttr, 'attributes.year.year', null),
      sku: _.get(pageAttr, 'attributes.sku.sku', null),
    };

    const breadcrumbPromise = productPromise
      .then(productDetails => breadcrumb.getByPage(BreadcrumbConfig.PDP, {
        first_level_category: productDetails.topLevelCategory,
        second_level_category: productDetails.category,
        part: productDetails.part,
      }));

    const structuredDataPromise = productPromise
      .then((productDetails) => {
        if (!_.has(productDetails, 'id')) {
          return null;
        }

        return structuredData.getRatings([productDetails.id]);
      });

    return [
      vehicle.years().catch(compositeErrorHandler),
      breadcrumbPromise.catch(compositeErrorHandler),
      meta.getByPage(MetaConfig.SKU, requestParams).catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
      widgets.getByPage(WidgetsConfig.SKU_PAGE).catch(compositeErrorHandler),
      productPromise.catch(compositeErrorHandler),
      catalog.getVehicleFitments(requestParams).catch(compositeErrorHandler),
      videos.getVideoBySku(sku).catch(compositeErrorHandler),
      this.blog.getPosts(3).catch(compositeErrorHandler),
      headings.getPageHeader(PagesConfig.sku, headerParams).catch(compositeErrorHandler),
      structuredDataPromise.catch(compositeErrorHandler),
    ];
  }

  /**
   * Transform attributes node
   *
   * @param {Object} request
   * @param {Object} pageAttr
   *
   * @returns {Object}
   */
  _getAttr(pageAttr) {
    const attributes = _.get(pageAttr, 'attributes', undefined);

    if (_.has(attributes, 'year')) {
      attributes.year = {
        yearId: _.get(attributes, 'year.year_id', null),
        year: _.get(attributes, 'year.year', null),
      };
    }

    if (_.has(attributes, 'make')) {
      attributes.make = {
        makeId: _.get(attributes, 'make.make_id', null),
        makeName: _.get(attributes, 'make.make_name', null),
        make: _.get(attributes, 'make.make', null),
      };
    }

    if (_.has(attributes, 'model')) {
      attributes.model = {
        modelId: _.get(attributes, 'model.model_id', null),
        modelName: _.get(attributes, 'model.model_name', null),
        model: _.get(attributes, 'model.model', null),
      };
    }

    if (_.has(attributes, 'submodel')) {
      attributes.submodel = {
        submodelId: _.get(attributes, 'submodel.submodel_id', null),
        submodelName: _.get(attributes, 'submodel.submodel_name', null),
        submodel: _.get(attributes, 'submodel.submodel', null),
      };
    }

    if (_.has(attributes, 'engine')) {
      attributes.engine = {
        engineId: _.get(attributes, 'engine.engine_id', null),
        cylinders: _.get(attributes, 'engine.cylinders', null),
        liter: _.get(attributes, 'engine.liter', null),
      };
    }

    if (_.has(attributes, 'part')) {
      attributes.part = {
        partId: _.get(attributes, 'part.part_id', null),
        partName: _.get(attributes, 'part.part_name', null),
        part: _.get(attributes, 'part.part', null),
      };
    }

    if (_.has(attributes, 'brand')) {
      attributes.brand = {
        brandId: _.get(attributes, 'brand.brand_id', null),
        brandName: _.get(attributes, 'brand.brand_name', null),
        brand: _.get(attributes, 'brand.brand', null),
      };
    }

    if (_.has(attributes, 'sku')) {
      attributes.sku = {
        productId: _.get(attributes, 'sku.product_id', null),
        sku: _.get(attributes, 'sku.sku', null),
      };
    }

    return attributes;
  }

  /**
   * Get search params
   *
   * @param {Object} request
   * @param {Object} pageAttr
   *
   * @returns {Object}
   */
  _getSearchParams(request, pageAttr) {
    const searchParams = {};
    const year = _.get(pageAttr, 'attributes.year.year', '');

    if (_.has(pageAttr, 'attributes.part.part_name')) {
      searchParams.part_name = pageAttr.attributes.part.part_name;
    }

    if (_.has(pageAttr, 'attributes.brand.brand_name')) {
      searchParams.brand_name = pageAttr.attributes.brand.brand_name;
    }

    if (_.has(pageAttr, 'attributes.sku.sku')) {
      searchParams.sku = pageAttr.attributes.sku.sku;
    }

    if (/\d{4}-\d{4}/.test(year)) {
      _.set(searchParams, 'yearRange', true);
    }

    if (_.has(request, 'query.vehicle')) {
      _(request.query.vehicle).each((val, key) => {
        _.set(searchParams, `vehicle.${key}`, decode(val));
      });

      return searchParams;
    }

    if (_.has(pageAttr, 'attributes.year.year')) {
      _.set(searchParams, 'vehicle.year', pageAttr.attributes.year.year);
    }

    if (_.has(pageAttr, 'attributes.make.make_name')) {
      _.set(searchParams, 'vehicle.make', pageAttr.attributes.make.make_name);
    }

    if (_.has(pageAttr, 'attributes.model.model_name')) {
      _.set(searchParams, 'vehicle.model', pageAttr.attributes.model.model_name);
    }

    if (_.has(pageAttr, 'attributes.submodel.submodel_name')) {
      _.set(searchParams, 'vehicle.submodel', pageAttr.attributes.submodel.submodel_name);
    }

    if (_.has(pageAttr, 'attributes.engine.cylinders')) {
      _.set(searchParams, 'vehicle.cylinders', pageAttr.attributes.engine.cylinders);
    }

    if (_.has(pageAttr, 'attributes.engine.liter')) {
      _.set(searchParams, 'vehicle.liter', pageAttr.attributes.engine.liter);
    }

    return searchParams;
  }
}
