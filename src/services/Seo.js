import { set, merge } from 'lodash';
import queryString from 'qs';
import CacheInstance from '../core/Cache';
import TIMEOUTS from '../configs/timeouts';
import SeoApiService from './SeoApiService';
import urls from '../configs/services/urls';
import { operationKeys, cache } from '../configs/services';
import VehicleTransformer from '../transformers/VehicleTransformer';
import BrandTransformer from '../transformers/BrandTransformer';
import SeoTransformer from '../transformers/SeoTransformer';
import CategoryTransformer from '../transformers/CategoryTransformer';
import Vehicle from './Vehicle';

export default class Seo extends SeoApiService {
  /** @interitdoc */
  constructor() {
    super();

    this.cache = CacheInstance;
    this.vehicleTransformer = new VehicleTransformer();
    this.brandsTransformer = new BrandTransformer();
    this.seoTransformer = new SeoTransformer();
    this.categoryTransformer = new CategoryTransformer();
    this.vehicles = new Vehicle();
    this.http = this._getClient(TIMEOUTS.CATALOG_2);
  }

  /**
   * Get top brands.
   *
   * @param {Integer} limit
   *
   * @returns {Object<Promise>}
   */
  topBrands(limit = 10) {
    return this._getTopItems(limit, 'topBrands', this.brandsTransformer);
  }

  /**
   * Get top parts.
   *
   * @param {Integer} limit
   * @param {Object} pageAttr
   *
   * @returns {Object<Promise>}
   */
  topParts(limit = 10, pageAttr) {
    return this._getTopItems(limit, 'topParts', this.vehicleTransformer, pageAttr);
  }

  /**
   * Get top parts.
   *
   * @param {Object} pageAttr
   *
   * @returns {Promise<Object>}
   */
  sortedTopParts(pageAttr) {
    const fn = () => new Promise((resolve, reject) => {
      const domain = this.getDomain();
      const attr = merge({}, pageAttr);

      const operation = operationKeys.GET_TOP40_PARTS;
      const queryParams = queryString.stringify({
        op: operation,
        data: JSON.stringify({
          site: this.getDomain(operation),
          page_type: 'mmp',
          make: encodeURIComponent(pageAttr.make.make_name),
          model: encodeURIComponent(pageAttr.model.model_name),
        }),
      }, { encode: false });

      this._get(urls.CATALOG_2, queryParams, operationKeys.GET_TOP40_PARTS)
        .then(result => resolve(this.vehicleTransformer.sortedTopParts(result, domain, attr)))
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify(pageAttr));

    return this.cache.remember(`get_top_sorted_parts_${cacheKey}`, cache.GET_TOP_40_PARTS, fn);
  }

  /**
   * Get top makes.
   *
   * @param {Integer} limit
   *
   * @returns {Object<Promise>}
   */
  topMakes(limit = 10) {
    return this._getTopItems(limit, 'topMakes', this.vehicleTransformer);
  }

  /**
   * Get top40parts
   *
   * @param {Object} attributes
   *
   * @returns {Promise<Object>}
   */
  getTop40Parts(attributes) {
    const fn = () => new Promise((resolve, reject) => {
      const operation = operationKeys.GET_TOP40_PARTS;
      const dataParams = {
        site: this.getDomain(operation),
      };

      if ('make' in attributes) {
        dataParams.make = attributes.make.make_name;
      }

      if ('model' in attributes) {
        dataParams.model = attributes.model.model_name;
      }

      if ('part' in attributes) {
        dataParams.part = attributes.part.part_name;
      }

      if ('year' in attributes) {
        dataParams.year = attributes.year.year;
      }

      const query = queryString.stringify({
        op: JSON.stringify(['getTop40Parts']),
        data: JSON.stringify(dataParams),
      }, { encode: false });

      const transformerParams = {
        ...dataParams,
        site: undefined,
      };

      this._get(urls.CATALOG_2, query, operation)
        .then(result => resolve(this.seoTransformer[operation].call(
          this.seoTransformer,
          result,
          this.getDomain(),
          transformerParams,
        )))
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify(attributes));

    return this.cache.remember(`get_top_40_parts_${cacheKey}`, cache.GET_TOP_40_PARTS, fn);
  }

  /**
   * Contain the string format of the uri
   *
   * @param {String} uri
   *
   * @returns {String}
   */
  getCanonicalUrl(uri) {
    return uri;
  }

  /**
   * Get Years for SEO Page
   *
   * @param {Object} attributes
   *
   * @returns {Object<Promise>}
   */
  getSeoYear(attributes, queryParams) {
    const fn = () => new Promise((resolve, reject) => {
      const operation = operationKeys.GET_SEO_YEARS;
      const queryAttr = {
        site: this.getDomain(operation),
        make: attributes.make.make_name,
        model: attributes.model.model_name,
        part: attributes.part.part_name,
      };

      const query = queryString.stringify({
        op: operation,
        data: JSON.stringify(queryAttr),
      }, { encode: false });

      return this._get(urls.CATALOG_2, query, operationKeys.GET_SEO_YEARS)
        .then(result => resolve(this.seoTransformer.getSeoYear(result, queryAttr, queryParams)))
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify(attributes));

    return this.cache.remember(`get_seo_year_${cacheKey}`, cache.GET_SEO_YEAR, fn);
  }

  /**
   * Retrieve the list of Model for the given Make
   *
   * @param {Object} attributes
   *
   * @returns {Object<Promise>}
   */
  getBrandPart(attributes) {
    const fn = () => new Promise((resolve, reject) => {
      const operation = operationKeys.GET_BRAND_PART;
      const filter = {
        make: ['=', `${attributes.make.make_name}`],
      };
      const dataParams = {
        site: this.getDomain(operation),
        catalogType: 'Auto',
        offset: '0',
        filter,
        display_node: ['model'],
        make: `${attributes.make.make_name}`,
        page_type: 'makepart',
        source: 'cpupwa',
      };

      const query = queryString.stringify({
        op: JSON.stringify([operation]),
        data: JSON.stringify(dataParams),
      }, { encode: false });

      this._get(urls.CATALOG_2, query, operation)
        .then(result => resolve(this.seoTransformer.getMakeModel(result, attributes)))
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify(attributes));

    return this.cache.remember(`get_brand_part_${cacheKey}`, cache.GET_BRAND_PART, fn);
  }

  /**
   * Get data for shopByModels node
   *
   * @param {Object} attributes
   * @param {Array} displayNode
   *
   * @return {Object<Promise>}
   */
  getShopByModels(pageAttr, displayNode) {
    const fn = () => new Promise((resolve, reject) => {
      const dataParams = {
        catalogType: 'Auto',
        site: this.getDomain(),
        source: 'cpupwa',
        offset: '0',
        display_node: displayNode,
      };

      if ('make' in pageAttr) {
        dataParams.make = pageAttr.make.make_name;
        set(dataParams, 'filter.make', ['=', pageAttr.make.make_name]);
      }

      if ('model' in pageAttr) {
        dataParams.model = pageAttr.model.model_name;
        set(dataParams, 'filter.model', ['=', pageAttr.model.model_name]);
      }

      if ('part' in pageAttr) {
        dataParams.part = pageAttr.part.part_name;
        set(dataParams, 'filter.part', ['=', pageAttr.part.part_name]);
      }

      if ('year' in pageAttr) {
        dataParams.year = pageAttr.year.year;
        set(dataParams, 'filter.year', ['=', pageAttr.year.year]);
      }

      const query = queryString.stringify({
        op: operationKeys.GET_BRAND_PART,
        data: JSON.stringify(dataParams),
      }, { encode: false });

      this._get(urls.CATALOG_2, query, operationKeys.GET_BRAND_PART)
        .then(result => resolve(
          this.categoryTransformer.transformShopByModels(result, dataParams),
        ))
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify({ pageAttr, displayNode }));

    return this.cache.remember(`get_shop_by_models_${cacheKey}`, cache.GET_SHOP_BY_MODELS, fn);
  }

  /**
   * Get static data content for home.
   *
   * @return {Promise<Object>}
   */
  getStaticDataContent() {
    const fn = () => new Promise((resolve, reject) => {
      this
        ._get(
          urls.SEO_CONTENTS,
          this._getStaticDataContentQuery(),
          operationKeys.GET_CONTENTS,
          this._transformerWithImage(this.seoTransformer, 'transformHomeStaticData'),
          TIMEOUTS.SEO_NEXUS,
        )
        .then(result => resolve(result))
        .catch(error => reject(error));
    });

    return this.cache.remember('get_static_data_content', cache.GET_STATIC_CONTENT, fn);
  }

  /**
   * Perform the request for getting top brands|parts|makes.
   *
   * @param {Integer} limit
   * @param {String} pageType
   * @param {Object} transformer
   * @param {Object} pageAttr
   *
   * @returns {Object<Promise>}
   */
  _getTopItems(limit, pageType, transformer, pageAttr) {
    const domain = this.getDomain();

    return this._get(
      urls.SEO,
      this._getTopQuery(limit, pageType),
      operationKeys.GET_TOP_SEO,
      null,
      TIMEOUTS.SEO,
    ).then(result => transformer[pageType](result, domain, pageAttr));
  }

  /**
   * Static data content query.
   *
   * @returns {String}
   */
  _getStaticDataContentQuery() {
    const domain = this.getDomain();

    return queryString.stringify({
      source: 'object',
      path: `/${domain}/contents/home`,
    }, { encode: false });
  }

  /**
   * Query uri for getting top brands|parts|makes.
   *
   * @param {Integer} limit
   * @param {String} pageType
   *
   * @returns {String}
   */
  _getTopQuery(limit, pageType) {
    const operation = operationKeys.GET_TOP_SEO;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        site: this.getDomain(operation),
        page_type: pageType,
        limit,
      }),
    }, { encode: false });
  }
}
