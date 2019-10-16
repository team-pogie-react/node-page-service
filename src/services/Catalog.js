import { _, merge } from 'lodash';
import queryString from 'qs';
import SeoApiService from './SeoApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import operationKeys from '../configs/services/operation-keys';
import CatalogTransformer from '../transformers/CatalogTransformer';
import CacheInstance from '../core/Cache';


export default class Catalog extends SeoApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.catalogTransformer = new CatalogTransformer();
    this.http = this._getClient(TIMEOUTS.CATALOG_2);
    this.cache = CacheInstance;
  }

  /**
   * getBrandPart
   *
   * @param {Object} attributes
   * @param {Object} options
   * @param {Object} transformer
   *
   * @returns {Promise<Object>}
   */
  getBrandPart(attributes, options, transformer) {
    const fn = () => new Promise((resolve, reject) => {
      const operation = _.get(operationKeys, 'GET_BRAND_PART');
      const transform = transformer !== undefined
        ? transformer : this._transformerWithImage(this.catalogTransformer, 'relatedParts');
      const dataParams = _.extend({
        catalogType: 'Auto',
        site: this.getDomain(operation),
        source: 'cpupwa',
        offset: 0,
        filter: this.createFilter(attributes),
        display_node: ['part'],
        lookup: 'brand',
      }, options || {});
      const query = queryString.stringify({
        op: operation,
        data: JSON.stringify(dataParams),
      }, { encode: false });

      this._get(urls.CATALOG_2, query, operation, transform)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify({ attributes, options, transformer }));

    return this.cache.remember(`get_dir_brand_part_${cacheKey}`, cache.GET_TOP_40_PARTS, fn);
  }

  /**
   * Get shop by parts.
   *
   * @param {Object} attributes
   *
   * @returns {Promise<Object>}
   */
  getShopByParts(attributes) {
    const fn = () => new Promise((resolve, reject) => {
      const operation = _.get(operationKeys, 'GET_BRAND_PART');
      const domain = this.getDomain(operation);
      const dataParams = _.extend({
        catalogType: 'Auto',
        site: domain,
        offset: 0,
        filter: this.createFilter(attributes),
        display_node: ['part'],
        lookup: 'brand',
        source: 'cpupwa',
      }, {});

      const query = queryString.stringify({
        op: operation,
        data: JSON.stringify(dataParams),
      }, { encode: false });

      this._get(urls.CATALOG_2, query, operation)
        .then(result => resolve(this.catalogTransformer.shopByParts(result, domain, attributes)))
        .catch(error => reject(error));
    });

    const cacheKey = `get_shop_by_parts_${this.cache.generateKey(JSON.stringify(attributes))}`;

    return this.cache.remember(cacheKey, cache.GET_SHOP_BY_PARTS, fn);
  }

  /**
   * Related brands getter.
   *
   * @param {Object} paramsAttr
   * @param {Object} origAttr
   *
   * @returns {Promise<Object}
   */
  getRelatedBrands(paramsAttr, origAttr) {
    const fn = () => new Promise((resolve, reject) => {
      const domain = this.getDomain();
      const operation = _.get(operationKeys, 'GET_BRAND_PART');
      const originalAttribute = merge({}, origAttr);
      const dataParams = {
        catalogType: 'Auto',
        site: this.getDomain(operation),
        source: 'cpupwa',
        offset: 0,
        filter: this.createFilter(paramsAttr), // part: somepart
        display_node: ['brand'],
        lookup: 'brand',
      };

      const query = queryString.stringify({
        op: operation,
        data: JSON.stringify(dataParams),
      }, { encode: false });

      this._get(urls.CATALOG_2, query, operation)
        .then(result => resolve(
          this.catalogTransformer.relatedParts(result, domain, originalAttribute),
        ))
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify({ paramsAttr, origAttr }));

    return this.cache.remember(`get_related_brands_${cacheKey}`, cache.GET_BRAND_PART_MAKE, fn);
  }

  /**
   * getBrandPartMake retrieves the result for getBrandPart with Make as specific filter
   *
   * @param {Object} attributes
   *
   * @returns {Promise<Object>}
   */
  getBrandPartMake(attributes) {
    const fn = () => new Promise((resolve, reject) => {
      const domain = this.getDomain();
      const operation = _.get(operationKeys, 'GET_BRAND_PART');
      const dataParams = {
        catalogType: 'Auto',
        site: this.getDomain(operation),
        source: 'cpupwa',
        offset: 0,
        filter: this.createFilter(attributes),
        display_node: ['make'],
      };
      const query = queryString.stringify({
        op: operation,
        data: JSON.stringify(dataParams),
      }, { encode: false });

      this._get(urls.CATALOG_2, query, operation)
        .then(result => resolve(this.catalogTransformer.relatedPartsByMake(
          result,
          domain,
          attributes,
        )))
        .catch(error => reject(error));
    });

    const cacheKey = `get_brand_part_make_${this.cache.generateKey(JSON.stringify(attributes))}`;

    return this.cache.remember(cacheKey, cache.GET_BRAND_PART_MAKE, fn);
  }

  /**
   * createFilter
   *
   * @param {Object} attributes
   *
   * @returns {Object} filter
   */
  createFilter(options) {
    const filter = {};

    _.each(options, (value, key) => {
      if (value !== '') {
        filter[key] = ['=', encodeURIComponent(value)];
      }
    });

    return filter;
  }

  /**
   * Get vehicle fitments of sku
   *
   * @param {Object} requestParams
   *
   * @returns {Promise<Object>}
   */
  getVehicleFitments(requestParams) {
    const operation = operationKeys.GET_VEHICLE_FITMENTS;
    const query = queryString.stringify({
      op: operation,
      data: JSON.stringify({
        site: this.getDomain(),
        catalogSource: 'Endeca',
        part: encodeURIComponent(requestParams.part || ''),
        brand: encodeURIComponent(requestParams.brand || ''),
        sku: encodeURIComponent(requestParams.sku || ''),
        make: encodeURIComponent(requestParams.make || ''),
        model: encodeURIComponent(requestParams.model || ''),
        year: encodeURIComponent(requestParams.year || ''),
      }),
    }, { encode: false });

    const cacheKey = `get_fitment_${this.cache.generateKey(JSON.stringify(requestParams))}`;
    const fn = () => this._get(urls.CATALOG_2, query, operation).then(result => ({
      vehicleFitments: _.get(result, 'vehicle_fitments', null),
      totalVehicleFitments: _.get(result, 'total_vehicle_fitments', null),
    }));

    return this.cache.remember(cacheKey, cache.GET_CATEGORIES, fn);
  }
}
