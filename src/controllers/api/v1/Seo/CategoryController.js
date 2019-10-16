import { _ } from 'lodash';
import queryString from 'qs';
import BaseController from '../../BaseController';
import { compositeErrorHandler } from '../../../../errors/handlers';
import CategoryService from '../../../../services/Category';
import Meta from '../../../../services/Meta';
import StrapiWidget from '../../../../services/widgets/StrapiWidget';
import WidgetConfig from '../../../../configs/services/widgets';
import operationKeys from '../../../../configs/services/operation-keys';
import Vehicle from '../../../../services/Vehicle';
import Breadcrumb from '../../../../services/Breadcrumb';
import Videos from '../../../../services/Videos';
import Blog from '../../../../services/Blog';
import Headings from '../../../../services/Headings';
import { decode } from '../../../../core/helpers';

export default class CategoryController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.metas = new Meta();
    this.widgets = new StrapiWidget();
    this.breadcrumb = new Breadcrumb();
    this.categories = new CategoryService();
    this.vehicles = new Vehicle();
    this.videos = new Videos();
    this.blogs = new Blog();
    this.headings = new Headings();
  }

  /**
   * List Categories depending on the supplied tier.
   * @param request
   * @param domain
   * @param otherData
   * @returns {Promise<*>}
   */
  async index(request, domain, otherData) {
    const data = this._parseCategory(otherData);
    let ymmseData = false;
    if (typeof request.query.vehicle !== 'undefined') {
      ymmseData = await this._parseYmmseData(request, domain);
    }

    let vehicle = {};
    let engineData = '';
    if (ymmseData !== false) {
      if (typeof request.query.vehicle.cylinders !== 'undefined') {
        engineData = `${request.query.vehicle.cylinders} Cyl `;
        if (typeof request.query.vehicle.liter !== 'undefined') {
          engineData += `${request.query.vehicle.liter}L`;
        }
      }
      if (typeof request.query.vehicle.engine !== 'undefined') {
        engineData = request.query.vehicle.engine;
      }

      vehicle = {
        year: request.query.vehicle.year,
        make: decode(request.query.vehicle.make),
        model: decode(request.query.vehicle.model),
        submodel: decode(request.query.vehicle.submodel),
        engine: decode(engineData),
      };
    }
    const {
      topTier,
      topTierName,
      secondTier,
      secondTierName,
    } = data;
    let passedValue = {
      key: 'first_level_category',
      value: topTier,
      nodeName: 'categories',
    };
    let videoParam = topTier;
    let categoryData = Promise.resolve([]);
    let breadcrumbParams = { first_level_category: topTierName };
    if (topTier !== undefined) {
      // Check if Second Tier is available as well.
      if (secondTier !== undefined) {
        passedValue = {
          key: 'second_level_category',
          value: secondTier,
          nodeName: 'categoryParts',
        };
        categoryData = this.categories.setDomain(domain)
          .getCategoryPart(topTier, secondTier, ymmseData);
        videoParam = secondTier;
        breadcrumbParams = {
          first_level_category: topTierName,
          second_level_category: secondTierName,
        };
      } else {
        categoryData = this.categories.setDomain(domain)
          .getTopTier(topTier, ymmseData);
      }
    }

    // For YMM
    if (_.isEmpty(vehicle)) {
      return Promise.all(this._aggregatedCategoryByLevel(
        categoryData,
        passedValue,
        domain,
        breadcrumbParams,
        videoParam,
        otherData,
      )).then(([
        metas,
        widgets,
        categoryResult,
        blogs,
        navigationCategories,
        breadcrumbs,
        videos,
        years,
        headers,
      ]) => Promise.resolve({
        meta: metas,
        widgets,
        breadcrumbs,
        [passedValue.nodeName]: categoryResult,
        navigationCategories,
        years,
        videos,
        blogs,
        header: _.get(headers, 'page', null),
      }));
    }

    return Promise.all(this._aggregatedCategoryByLevel(
      categoryData,
      passedValue,
      domain,
      breadcrumbParams,
      videoParam,
      otherData,
    )).then(([
      metas,
      widgets,
      categoryResult,
      blogs,
      navigationCategories,
      breadcrumbs,
      videos,
      years,
      headers,
    ]) => Promise.resolve({
      meta: metas,
      widgets,
      breadcrumbs,
      vehicle,
      [passedValue.nodeName]: categoryResult,
      navigationCategories,
      years,
      videos,
      blogs,
      header: _.get(headers, 'page', null),
    }));
  }

  /**
   * Determine Category availability
   * @param request
   * @returns {Promise<*>}
   * @private
   */
  _parseCategory(request) {
    const { tlc, cat } = request.attributes;
    // Top Tier only
    if (typeof tlc !== 'undefined') {
      return {
        topTier: tlc.tlc_category_name,
        topTierName: tlc.tlc_category_name,
      };
    }

    // With Second Tier
    return {
      topTier: cat.tlc_category_name,
      topTierName: cat.tlc_category_name,
      secondTier: cat.cat_category_name,
      secondTierName: cat.cat_category_name,
    };
  }

  /**
   * Parse Pretty URL
   * @param url
   * @returns {Promise<String>}
   * @private
   */
  async _parsePrettyUrl(url) {
    // Split Data
    const splitData = url.split('~');

    if (typeof splitData[1] !== 'undefined') {
      return this._parseCharacters(splitData[1]);
    }

    return this._parseCharacters(splitData[0]);
  }

  async _parseCharacters(url) {
    let data = url;
    // Remove HTML
    data = data.replace(/\.html/g, '');
    // Convert -comma- to comma
    data = data.replace(/-comma-/g, ',');
    data = data.replace(/-and-/g, '&');
    data = data.replace(/-dot-/g, '');
    data = data.replace(/_/g, ' ');

    return data;
  }

  /**
   * Aggregate Categories
   * @param categories
   * @param passedData
   * @param domain
   * @param breadcrumbParams
   * @param videoParam
   * @param otherData
   * @returns {*[]}
   * @private
   */
  _aggregatedCategoryByLevel(categories,
    passedData,
    domain,
    breadcrumbParams,
    videoParam,
    otherData) {
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const navCategories = this.categories.setDomain(domain);
    const breadcrumbs = this.breadcrumb.setDomain(domain);
    const videos = this.videos.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const headings = this.headings.setDomain(domain);

    // Determine Category Level
    let categoryLevel = WidgetConfig.LEVEL1_CATEGORY_PAGE;
    if (passedData.key === 'second_level_category') {
      categoryLevel = WidgetConfig.LEVEL2_CATEGORY_PAGE;
    }

    return [
      metas.getByPage(passedData.key, {
        [passedData.key]: passedData.value,
      }).catch(compositeErrorHandler),
      widgets.getByPage(categoryLevel).catch(compositeErrorHandler),
      categories.catch(compositeErrorHandler),
      this.blogs.getPosts(6).catch(compositeErrorHandler),
      navCategories.get().catch(compositeErrorHandler),
      breadcrumbs.getByPage(passedData.key, breadcrumbParams).catch(compositeErrorHandler),
      videos.getCategoryVideo(videoParam).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      headings.getPageHeader('category', otherData).catch(compositeErrorHandler),
    ];
  }

  /**
   * Parse YMMSE
   * @param ymmseData
   * @param domain
   * @returns {Promise<*>}
   * @private
   */
  async _parseYmmseData(ymmseData, domain) {
    try {
      const {
        year,
        make,
        model,
        submodel,
        cylinders,
        liter,
        engine,
      } = ymmseData.query.vehicle;
      let engineData = '';
      if (typeof engine !== 'undefined') {
        engineData = engine;
      }

      if (typeof year === 'undefined' || typeof make === 'undefined' || typeof model === 'undefined') {
        return false;
      }

      if (typeof cylinders !== 'undefined') {
        engineData = `${cylinders} Cyl `;
        if (typeof liter !== 'undefined') {
          engineData += `${liter}L`;
        }
      }

      const operation = operationKeys.GET_VEHICLEPLDBID;
      const data = queryString.stringify({
        op: operation,
        data: JSON.stringify({
          catalogSource: 'productlookupdb',
          site: 'carparts.com',
          year,
          make,
          model,
          submodel,
          engine: engineData,
        }),
        format: 'json',
      }, { encode: true });

      const pldbData = await this.vehicles.setDomain(domain).getPLDBIDByText(data);

      let returnData = {};
      if (typeof pldbData.vehiclePldbIdByYMM !== 'undefined') {
        if (typeof pldbData.vehiclePldbIdByYMM.year !== 'undefined'
          && typeof pldbData.vehiclePldbIdByYMM.make !== 'undefined'
          && typeof pldbData.vehiclePldbIdByYMM.model !== 'undefined'
          && typeof pldbData.vehiclePldbIdByYMM.PLDB_ID !== 'undefined') {
          const extractPldb = pldbData.vehiclePldbIdByYMM.PLDB_ID.split('-');
          returnData = {
            year: extractPldb[0],
            make: extractPldb[1],
            model: extractPldb[2],
          };

          if (typeof pldbData.vehiclePldbIdByYMM.submodel !== 'undefined'
            && typeof pldbData.vehiclePldbIdByYMM.engine !== 'undefined') {
            returnData = { submodel: extractPldb[3], ...returnData };
            returnData = { engine: extractPldb[4], ...returnData };
          } else if (typeof pldbData.vehiclePldbIdByYMM.submodel !== 'undefined'
            && typeof pldbData.vehiclePldbIdByYMM.engine === 'undefined') {
            returnData = { submodel: extractPldb[3], ...returnData };
          } else if (typeof pldbData.vehiclePldbIdByYMM.submodel === 'undefined'
            && typeof pldbData.vehiclePldbIdByYMM.engine !== 'undefined') {
            returnData = { engine: extractPldb[3], ...returnData };
          }
        }
      }

      return returnData;
    } catch (error) {
      return error;
    }
  }
}
