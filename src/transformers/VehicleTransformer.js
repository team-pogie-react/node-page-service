import _ from 'lodash';
import Image from '../core/Image';
import { decode, getLinkByPageAttr, getTextByPageAttr } from '../core/helpers';

export default class VehicleTransformer {
  /**
   * Transform top parts api response.
   *
   * @param {Object} parts
   * @param {String} domain
   * @param {Object} pageAttr
   *
   * @returns {Array}
   */
  topParts(parts, domain, pageAttr) {
    return this._transformTop(parts, 'part', domain, pageAttr);
  }

  /**
   * Transform top parts api response, sorted alphabetical manner.
   *
   * @param {Object} parts
   * @param {String} domain
   * @param {Object} pageAttr
   *
   * @returns {Array}
   */
  sortedTopParts(parts, domain, pageAttr) {
    return this._transformSortedTop(parts, 'part', domain, pageAttr);
  }

  /**
   * Transform top makes api response.
   *
   * @param {Object} make
   * @param {String} domain
   *
   * @returns {Array}
   */
  topMakes(makes, domain) {
    return this._transformTop(makes, 'make', domain);
  }

  /**
   * Transform top collection.
   *
   * @param {Object<Array>} collection
   * @param {String} key
   * @param {String} domain
   * @param {Object} pageAttr
   *
   * @returns {Array}
   */
  _transformTop(collection, key, domain, pageAttr) {
    if (!_.isObject(collection)) {
      return [];
    }

    const result = [];
    const attr = pageAttr;

    _.each(collection, (item) => {
      const text = item.tags[key];
      attr[key] = _.get(item.tags, key, '');

      result.push({
        text: getTextByPageAttr(attr),
        link: getLinkByPageAttr(attr),
        image: Image.url(text, domain),
      });
    });

    return result;
  }

  /**
   * Transform top collection in sorted order.
   *
   * @param {Object<Array>} collection
   * @param {String} key
   * @param {String} domain
   * @param {Object} pageAttr
   *
   * @returns {Array}
   */
  _transformSortedTop(collection, key, domain, pageAttr) {
    if (!_.isObject(collection)) {
      return [];
    }

    const result = [];
    const attr = pageAttr;

    _.each(collection, (part) => {
      attr[key] = part;

      result.push({
        text: getTextByPageAttr(attr),
        link: getLinkByPageAttr(attr),
        image: Image.url(part, domain),
      });

      return true;
    });

    return result;
  }

  /**
   * Transform Vehicle ID
   * @param {Object<Array>}data
   * @returns {Array}
   */
  _transformVehicleId(data) {
    if (!_.isObject(data)) {
      return [];
    }

    return {
      vehicle_id: data.value.VEHICLE_ID,
    };
  }

  /**
   * Transform Vehicle ID
   * @param {Object<Array>}data
   * @returns {Array}
   */
  _transformPldbByYmm(data) {
    if (!_.isObject(data)) {
      return [];
    }

    // Split PLDB ID
    const splitData = data.value.PLDB_ID.split('-');

    return {
      year: typeof splitData[0] !== 'undefined' ? splitData[0] : '',
      make: typeof splitData[1] !== 'undefined' ? splitData[1] : '',
      model: typeof splitData[2] !== 'undefined' ? splitData[2] : '',
      submodel: typeof splitData[3] !== 'undefined' ? splitData[3] : '',
      engine: typeof splitData[4] !== 'undefined' ? splitData[4] : '',
    };
  }

  _transformVehicleSelector(data) {
    if (!_.isObject(data)) {
      return [];
    }
    const key = Object.keys(data.value[0])[0];
    const dataValue = [];
    _.map(data.value, (value) => {
      if (key === 'year') {
        // Convert to Integer
        dataValue.push(parseInt(value[key], 10));
      } else {
        dataValue.push(value[key]);
      }
    });

    return dataValue;
  }

  /**
   * Transform Vehicle ID
   * @param data
   * @returns {array}
   */
  transformVehicleInfo(data) {
    if (!_.isObject(data)) {
      return [];
    }
    let record = [];
    let ctr = 0;
    _.each(data, (value, keys) => {
      record = [{
        pid: ctr,
        vehicle_id: keys,
        year: value.year.id,
        make: decode(value.make.name),
        model: decode(value.model.name),
        submodel: decode(value.submodel.name),
        engine: decode(value.engine.name),
        site: value.site.name,
      }];
      ctr += 1;
    });

    return {
      vehicle_info: record,
    };
  }

  /**
   * Transform PLDB ID YMM
   * @param data
   * @returns {*}
   */
  transformYMMPldbId(data) {
    if (!_.isObject(data)) {
      return [];
    }

    return {
      vehiclePldbIdByYMM: data.value,
    };
  }

  /**
   * Transform Shop Vehicle
   * @param data
   * @returns {array}
   * @private
   */
  _transformIsShopVehicle(data) {
    if (!_.isObject(data)) {
      return [];
    }

    return {
      vehicle_info: data,
    };
  }
}
