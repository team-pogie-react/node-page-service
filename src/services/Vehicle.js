import _ from 'lodash';
import queryString from 'qs';
import ApiService from './ApiService';
import { cache, urls } from '../configs/services';
import operationKeys from '../configs/services/operation-keys';
import VehicleTransformer from '../transformers/VehicleTransformer';
import CacheInstance from '../core/Cache';
import { decode } from '../core/helpers';
import TIMEOUTS from '../configs/timeouts';

export default class Vehicle extends ApiService {
  /**
   * Initialize
   */
  constructor() {
    super();
    this.cache = CacheInstance;
    this.transformer = new VehicleTransformer();
    this.http = this._getClient(TIMEOUTS.CATALOG_2);
  }

  /**
   * Get years from catalog.
   *
   * @returns {Object<Promise>}
   */
  years() {
    const fn = () => new Promise((resolve, reject) => {
      try {
        const query = this._yearsQuery();

        this._get(urls.CATALOG_2, query, operationKeys.GET_YEARS)
          .then((result) => {
            const { value } = result;
            const years = value ? value.split('|') : [];

            resolve(_.map(years, _.parseInt));
          })
          .catch(error => reject(error));
      } catch (error) {
        reject(error);
      }
    });

    return this.cache.remember('get_years', cache.GET_YEARS, fn);
  }

  /**
   * Uri query for years request.
   */
  _yearsQuery() {
    const operation = operationKeys.GET_YEARS;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        catalogSource: 'Endeca',
        site: this.getDomain(operation),
        pipeDelimited: 1,
      }),
    }, { encode: false });
  }

  /**
   * Display Vehicle ID
   * @param data
   * @returns {Promise<any>}
   */
  getVehicleIdByYMM(data) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        data,
        operationKeys.GET_VEHICLE_ID,
        this._transformerWithImage(this.transformer, '_transformVehicleId'),
      ).then(response => resolve(response)).catch(error => reject(error));
    });
  }

  getVehicleSelectorByType(data, opKey) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        data,
        opKey,
        this._transformerWithImage(this.transformer, '_transformVehicleSelector'),
      ).then(response => resolve(response)).catch(error => reject(error));
    });
  }

  /**
   * Retrieve Vehicle Information
   * @param data
   * @returns {Promise<any>}
   */
  getVehicleInfoById(data) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        data,
        operationKeys.GET_VEHICLE_INFO,
        this._transformerWithImage(this.transformer, 'transformVehicleInfo'),
      ).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  getPLDBIdByYMM(data) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        data,
        operationKeys.GET_VEHICLEPLDBID,
        this._transformerWithImage(this.transformer, '_transformPldbByYmm'),
      ).then(response => resolve(response)).catch(error => reject(error));
    });
  }

  getPLDBIDByText(data) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        data,
        operationKeys.GET_VEHICLEPLDBID,
        this._transformerWithImage(this.transformer, 'transformYMMPldbId'),
      ).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Determine if it is Shop
   * @param data
   * @returns {Promise<any>}
   */
  isShopVehicle(data) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        data,
        operationKeys.IS_SHOP_VEHICLE,
        this._transformerWithImage(this.transformer, '_transformIsShopVehicle'),
      ).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Parse getVehicleIdByYmm
   * @param data
   * @returns {string|*}
   */
  _parseGetVehicleIdByYMM(data) {
    const operation = operationKeys.GET_VEHICLE_ID;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        catalogSource: 'productlookupdb',
        site: this.getDomain(operation),
        year: data.year,
        model: decode(data.model),
        make: decode(data.make),
        engine: (typeof data.engine !== 'undefined' ? decode(data.engine) : ''),
        submodel: (typeof data.submodel !== 'undefined' ? decode(data.submodel) : ''),
      }),
      format: 'json',
    }, { encode: true });
  }

  _parseGetPLDBIdByYMM(data) {
    const operation = operationKeys.GET_VEHICLEPLDBID;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        catalogSource: 'productlookupdb',
        site: this.getDomain(operation),
        year: data.year,
        model: decode(data.model),
        make: decode(data.make),
        engine: (typeof data.engine !== 'undefined' ? decode(data.engine) : ''),
        submodel: (typeof data.submodel !== 'undefined' ? decode(data.submodel) : ''),
      }),
      format: 'json',
    }, { encode: true });
  }

  /**
   * Parse getVehicleInfoById
   * @param vehicleId
   * @returns {string|*}
   */
  _parseGetVehicleInfoById(vehicleId) {
    const operation = operationKeys.GET_VEHICLE_INFO;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        catalogSource: 'productlookupdb',
        site: this.getDomain(operation),
        vehicleId,
      }),
      format: 'json',
    }, { encode: true });
  }

  /**
   * Parse isShopVehicle
   * @param vehicleId
   * @returns {string|*}
   */
  _parseIsShopVehicle(vehicleId) {
    const operation = operationKeys.IS_SHOP_VEHICLE;

    return queryString.stringify({
      op: operation,
      data: JSON.stringify({
        catalogSource: 'productlookupdb',
        site: this.getDomain(operation),
        vehicleId,
      }),
      format: 'json',
    }, { encode: true });
  }
}
