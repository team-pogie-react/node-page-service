import queryString from 'qs';
import _ from 'lodash';
import Promise from 'bluebird';
import MetasConfig from '../../../configs/services/metas';
import WidgetsConfig from '../../../configs/services/widgets';
import Breadcrumbs from '../../../configs/services/breadcrumbs';
import constant from '../../../configs/constant';
import BaseController from '../BaseController';
import Seo from '../../../services/Seo';
import Vehicle from '../../../services/Vehicle';
import Category from '../../../services/Category';
import Meta from '../../../services/Meta';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import { compositeErrorHandler } from '../../../errors/handlers';
import Breadcrumb from '../../../services/Breadcrumb';
import { decode } from '../../../core/helpers';
import Videos from '../../../services/Videos';
import Blog from '../../../services/Blog';
import operationKeys from '../../../configs/services/operation-keys';

export default class VehiclesController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();
    this.vehicles = new Vehicle();
    this.seo = new Seo();
    this.categories = new Category();
    this.breadcrumb = new Breadcrumb();
    this.metas = new Meta();
    this.widgets = new StrapiWidget();
    this.videos = new Videos();
    this.blogs = new Blog();
  }

  async getVehicleSelector(request, response) {
    try {
      const domain = this.getDomain(request);
      const dataRequest = request;
      dataRequest.operationKeys = this.getVehicleSelectorOperationKey(dataRequest);
      // Validate parameters
      const validate = this.validateVehicleSelector(dataRequest);
      if (!dataRequest.operationKeys) {
        validate.message = 'Invalid Vehicle Selector type.';
      }
      if (!validate.status || !dataRequest.operationKeys) {
        return response.withError(validate.message, 400);
      }
      const result = await Promise.all(this._aggregatedVehicleSelector(domain, dataRequest)).then(([
        vehicleSelected,
      ]) => Promise.resolve(vehicleSelected));

      if (typeof result === 'undefined') {
        return response.withError(`No ${dataRequest.params.type} found`, 404);
      }

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status);
    }
  }

  validateVehicleSelector(data) {
    const {
      year,
      model,
      make,
      submodel,
    } = data.query;
    switch (data.operationKeys) {
      case operationKeys.GET_ENGINE:
        if (typeof year === 'undefined') {
          return {
            status: false,
            message: 'Year parameter is missing',
          };
        }
        if (typeof make === 'undefined') {
          return {
            status: false,
            message: 'Make parameter is missing',
          };
        }
        if (typeof model === 'undefined') {
          return {
            status: false,
            message: 'Model parameter is missing',
          };
        }
        if (typeof submodel === 'undefined') {
          return {
            status: false,
            message: 'Sub Model parameter is missing',
          };
        }
        break;
      case operationKeys.GET_SUB_MODEL:
        if (typeof year === 'undefined') {
          return {
            status: false,
            message: 'Year parameter is missing',
          };
        }
        if (typeof make === 'undefined') {
          return {
            status: false,
            message: 'Make parameter is missing',
          };
        }
        if (typeof model === 'undefined') {
          return {
            status: false,
            message: 'Model parameter is missing',
          };
        }
        break;
      case operationKeys.GET_MODEL:
        if (typeof make === 'undefined') {
          return {
            status: false,
            message: 'Make parameter is missing',
          };
        }
        break;
      default:
        break;
    }

    return {
      status: true,
    };
  }

  /**
   * Vehicle Selector get proper Operation Keys
   * @param data
   * @returns {string}
   */
  getVehicleSelectorOperationKey(data) {
    const {
      type,
    } = data.params;
    const {
      model,
      make,
    } = data.query;

    // Determine Query need
    switch (type) {
      case 'engine':
        return operationKeys.GET_ENGINE;
      case 'submodel':
        return operationKeys.GET_SUB_MODEL;
      case 'model':
        // Check if MMY
        if (typeof make !== 'undefined') {
          return operationKeys.GET_MODEL_MMY;
        }

        return operationKeys.GET_MODEL;
      case 'make':
        return operationKeys.GET_MAKE;
      case 'year':
        // Check if MMY
        if (typeof make !== 'undefined' && typeof model !== 'undefined') {
          return operationKeys.GET_YEARS_MMY;
        }

        return operationKeys.GET_YEARS;
      default:
        return false;
    }
  }

  /**
   * Get Vehicle ID
   *
   * @param request
   * @param response
   * @returns {Object}
   */
  async getVehicleIdByYMM(request, response) {
    try {
      const domain = this.getDomain(request);
      const {
        year,
        model,
        make,
        engine,
        submodel,
        uri,
      } = request.query;

      // Check if URI query exists
      let data = this._parseURI(uri);
      let errorYmm = '';
      if (data) {
        // Check if URI query has an error
        if (typeof data.status !== 'undefined') {
          return response.withError(data.message, 400);
        }
      }

      if (!data) {
        data = {
          year,
          model,
          make,
          engine,
          submodel,
        };
      }

      if (typeof uri === 'undefined') {
        if ((year === '' || typeof year === 'undefined')
          || (make === '' || typeof make === 'undefined')
          || (model === '' || typeof model === 'undefined')) {
          errorYmm += (year === '' || typeof year === 'undefined') ? 'Year ' : '';
          errorYmm += (make === '' || typeof make === 'undefined') ? 'Make ' : '';
          errorYmm += (model === '' || typeof model === 'undefined') ? 'Model ' : '';
          errorYmm += '(YMM) parameter is required.';

          return response.withError(errorYmm, 400);
        }
      }

      const vehicleInfo = await this.vehicles.setDomain(domain)
        .getVehicleIdByYMM(
          this.vehicles._parseGetVehicleIdByYMM(data),
        );

      // Get Vehicle PLDB ID
      const pldbInfo = await this.vehicles.setDomain(domain)
        .getPLDBIdByYMM(this.vehicles._parseGetPLDBIdByYMM(data));
      const result = await this.getVehicleInfoById(
        vehicleInfo.vehicle_id,
        pldbInfo,
        domain,
        response,
      );

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status);
    }
  }

  /**
   * Get Vehicle Information
   * @param vehicleId
   * @param ymmse
   * @param domain
   * @param response
   * @returns {Promise<void|*>}
   */
  async getVehicleInfoById(vehicleId, ymmse, domain, response) {
    try {
      const categories = this.categories.setDomain(domain);
      const breadcrumb = this.breadcrumb.setDomain(domain);
      const vehicles = this.vehicles.setDomain(domain);
      const data = await this.vehicles.setDomain(domain)
        .getVehicleInfoById(
          this.vehicles._parseGetVehicleInfoById(vehicleId),
        );
      const {
        year,
        make,
        model,
        site,
      } = data.vehicle_info[0];
      let { submodel, engine } = data.vehicle_info[0];
      if (engine === 'undefined') {
        engine = '';
      }
      if (submodel === 'undefined') {
        submodel = '';
      }

      // Attach PLDB IDs for query
      const vehicle = {
        year: ymmse.year,
        make: ymmse.make,
        model: ymmse.model,
        submodel: ymmse.submodel,
        engine: ymmse.engine,
        site,
      };

      // Vehicle Node
      const vehicleNode = {
        year,
        make,
        model,
        submodel,
        engine,
      };

      // Retrieve Categories
      const categoryData = await this.categories.setDomain(domain)
        .getVLP(vehicle, response, domain).catch(compositeErrorHandler);
      const categoryPart = (typeof categoryData.error === 'undefined')
        ? await this._parseCategoryForVLP(categoryData).catch(compositeErrorHandler) : categoryData;
      const navigationCategories = await categories.get().catch(compositeErrorHandler);
      const yearsNode = await vehicles.years().catch(compositeErrorHandler);
      const vehicleString = `${year} ${decode(make)} ${decode(model)} ${decode(submodel)} ${decode(engine)}`;
      const breadcrumbs = await breadcrumb.getByPage(
        Breadcrumbs.VLP, {
          vehicle: vehicleString,
        },
      ).catch(compositeErrorHandler);
      const videos = await this.videos.getCommon().catch(compositeErrorHandler);
      const blogs = await this.blogs.getPosts(6).catch(compositeErrorHandler);

      return await Promise.all(this._aggregatedVehicleInfo(domain, vehicle)).then(([
        metas,
        widgets]) => Promise.resolve({
        meta: metas,
        widgets,
        vehicle: vehicleNode,
        categoryPart,
        navigationCategories,
        videos,
        blogs,
        years: yearsNode,
        breadcrumb: breadcrumbs,
        pageType: constant.PAGETYPE.vlp,
      }));
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   *
   * @param request
   * @param response
   * @returns {Object}
   */
  async isShopVehicle(request, response) {
    try {
      const domain = this.getDomain(request);
      const { vehicleId } = request.query;
      const result = await this.vehicles.setDomain(domain)
        .isShopVehicle(
          this.vehicles._parseIsShopVehicle(vehicleId),
        );

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Vehicle Landing Page return values
   *
   * @param domain
   * @param vehicle
   * @return {Object}
   * @private
   */
  _aggregatedVehicleInfo(domain, vehicle) {
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage(MetasConfig.VEHICLE_LANDING_PAGE, vehicle).catch(compositeErrorHandler),
      widgets.getByPage(WidgetsConfig.VEHICLE_LANDING_PAGE).catch(compositeErrorHandler),
    ];
  }

  _aggregatedVehicleSelector(domain, selected) {
    const vehicles = this.vehicles.setDomain(domain);
    const query = this._getVehicleSelectorQuery(selected);

    return [
      vehicles.getVehicleSelectorByType(query, selected.operationKeys).catch(compositeErrorHandler),
    ];
  }

  _getVehicleSelectorQuery(selected) {
    const {
      year,
      make,
      model,
      submodel,
      engine,
    } = selected.query;
    const data = queryString.stringify({
      op: selected.operationKeys,
      data: JSON.stringify({
        catalogSource: 'Endeca',
        site: 'carparts.com',
        year,
        make,
        model,
        submodel,
        engine,
      }),
      format: 'json',
    }, { encode: true });

    return data;
  }

  /**
   * Parsing for Vehicle Landing Page
   *
   * @param data
   *
   * @returns {Object}
   */
  _parseCategoryForVLP(data) {
    return new Promise((resolve) => {
      const result = data;
      // Remove meta and widgets
      delete result.meta;
      delete result.widgets;

      _.forEach(result, (item) => {
        _.forEach(item.categories, (subItem) => {
          const resultSubitem = subItem;
          delete resultSubitem.subcategories;
        });
      });

      resolve(result);
    });
  }

  /**
   * Parsed the URI provided over query.
   * @param uri
   * @returns {boolean}
   * @private
   */
  _parseURI(uri) {
    if (typeof uri === 'undefined') {
      return false;
    }

    const splitURI = uri.split('/');
    const patternConfig = constant.VLP_PATTERN_QUERY.split('/');
    let URICounter = 1;
    const parseData = {};
    const year = parseInt(splitURI[1], 10);
    if (Number.isNaN(year)) {
      return {
        status: false,
        message: 'Year parameter is required',
      };
    }
    _.forEach(patternConfig, (data) => {
      parseData[data] = splitURI[URICounter];
      URICounter += 1;
    });

    return parseData;
  }
}
