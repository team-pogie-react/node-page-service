import { _, merge } from 'lodash';
import queryString from 'qs';
import Image from '../../../Image';
import templates from './config/template';
import Url from './url';
import { seoEncode } from '../../../helpers';

class Formatter {
  constructor() {
    this.url = new Url();
    this.domain = '';
  }

  setDomain(domain) {
    this.domain = domain;

    return this;
  }

  /**
   * setUrl()
   * @description: Generic Template for related parts, category
   * @param {string} pageType
   * @param  {Object} scope
   *
   * @return array
   */
  generateUrl(pageType, scope) {
    const template = _.get(templates, pageType, '');

    if (!_.isObject(scope) && _.size(scope)) {
      return '';
    }

    if (template !== '') {
      try {
        return _.template(template)(scope) || '';
      } catch (err) {
        return '';
      }
    }

    return '';
  }

  /**
   * map()
   * @description: Generic Template for related parts, category /{map}/{item[`part_name`]}
   * @param {String} map
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  map(map, collection, domain) {
    const mappedItems = [];

    _.each(collection, (item) => {
      const record = {};
      const partName = _.get(item, 'part_name') || '';
      _.set(record, 'link', this.url.encode([map, partName]));
      _.set(record, 'image', Image.url(partName, domain));
      _.set(record, 'text', `${_.upperFirst(map)} ${partName}`);
      mappedItems.push(record);
    });

    return mappedItems;
  }

  /**
   * mapPartsToBrand()
   *
   * @param {String} brand
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapPartsToBrand(brand, collection, domain) {
    const brandParts = [];

    if (typeof brand !== 'string' && brand !== '') {
      return brandParts;
    }

    _.each(collection, (item) => {
      const record = {};
      const partName = _.get(item, 'part_name') || '';
      _.set(record, 'link', this.url.encode([brand, partName]));
      _.set(record, 'image', Image.url(partName, domain));
      _.set(record, 'text', `${_.upperFirst(brand)} ${partName}`);

      brandParts.push(record);
    });

    return brandParts || [];
  }

  /**
   * mapBrandsToPart()
   *
   * @param {String} part
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapBrandsToPart(part, collection, domain) {
    const brandParts = [];

    if (typeof part !== 'string' && part !== '') {
      return brandParts;
    }

    _.each(collection, (item) => {
      const record = {};
      const brandName = _.get(item, 'brand_name') || '';
      _.set(record, 'link', this.url.encode([brandName, part]));
      _.set(record, 'image', Image.url(brandName, domain));
      _.set(record, 'text', `${_.upperFirst(brandName)} ${part}`);

      brandParts.push(record);
    });

    return brandParts || [];
  }

  /**
   * mapRelBrandParts()
   *
   * @param {String} brand
   * @param {String} part
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapRelBrandParts(brand, part, collection, domain) {
    const brandParts = [];

    if (typeof part !== 'string' && typeof brand !== 'string' && part !== '' && brand !== '') {
      return brandParts;
    }

    _.each(collection, (item) => {
      const record = {};
      const partName = _.get(item, 'part_name') || '';
      _.set(record, 'link', this.url.encode([brand, partName]));
      _.set(record, 'image', Image.url(brand, domain));
      _.set(record, 'text', `${brand} ${_.upperFirst(partName)} ${part}`);

      brandParts.push(record);
    });

    return brandParts || [];
  }

  /**
   * mapMakeModelPartToMakeModel()
   *
   * @param {String} make
   * @param {String} model
   * @param {Object} collection
   * @param {object} domain
   *
   * @return array
  */
  mapMakeModelPartToMakeModel(make, model, collection, domain) {
    const makeModelParts = [];

    if (make === '' || model === '') {
      return makeModelParts;
    }

    _.each(collection, (item) => {
      const record = {};
      const partName = _.get(item, 'part_name') || '';
      _.set(record, 'link', this.url.encode([partName, make, model]));
      _.set(record, 'image', Image.url(partName, domain));
      _.set(record, 'text', `${_.upperFirst(make)} ${_.upperFirst(model)} ${_.upperFirst(partName)}`);

      makeModelParts.push(record);
    });

    return makeModelParts;
  }

  /**
   * mapPartsToMake()
   *
   * @param {String} make
   * @param {Object} parts
   * @param {String} domain
   *
   * @return array
   */
  mapPartsToMake(make, parts, domain) {
    const partMakes = [];

    if (!_.isArray(parts) || make === '') {
      return partMakes;
    }

    _.each(parts, (item) => {
      const record = {};
      const partName = item || '';
      _.set(record, 'link', this.url.encode([partName, make]));
      _.set(record, 'image', Image.url(partName, domain));
      _.set(record, 'text', `${_.upperFirst(make)} ${partName}`);

      partMakes.push(record);
    });

    return partMakes;
  }

  /**
   * mapModelsToMake()
   *
   * @param {String} make
   * @param {Object} collection
   * @param {String} suffix
   * @param {String} domain
   * @param {Object} options
   * @description Make Model
   *
   * @return array
   */
  mapModelsToMake(make, collection, suffix, domain, options) {
    const self = this;
    const makeModels = [];
    const urlPrefix = _.get(options, 'url.prefix', '');
    const urlSuffix = _.get(options, 'url.suffix', '');

    if (!_.isArray(collection) || make === '') {
      return makeModels;
    }

    _.each(collection, (item) => {
      const record = {};
      const modelName = _.get(item, 'model') || '';
      _.set(record, 'link', urlPrefix + self.url.encode([make, modelName]) + urlSuffix);
      _.set(record, 'image', Image.url(modelName, domain));
      _.set(record, 'text', `${_.upperFirst(make)} ${modelName} ${suffix}`);

      makeModels.push(record);
    });


    return makeModels;
  }

  /**
   * mapMakesToPart()
   *
   * @param {String} part
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapMakesToPart(part, collection, domain) {
    const makeParts = [];

    if (part === '' || !_.isObject(collection)) {
      return makeParts;
    }

    _.each(collection, (item) => {
      const record = {};
      const makeName = _.get(item, 'make') || '';
      _.set(record, 'link', this.url.encode([part, makeName]));
      _.set(record, 'image', Image.url(makeName, domain));
      _.set(record, 'text', `${_.upperFirst(makeName)} ${part}`);

      makeParts.push(record);
    });

    return makeParts;
  }

  /**
   * mapMakeModelPartToMakePart()
   *
   * @param {String} map
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapMakeModelPartToMakePart(map, collection, domain) {
    return this.map(map, collection, domain);
  }

  /**
   * mapRelParts()
   *
   * @param {String} map
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapRelParts(map, collection, domain) {
    return this.map(map, collection, domain);
  }

  /**
   * mapRelMakeParts()
   *
   * @param {String} map
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapRelMakeParts(map, collection, domain) {
    return this.map(map, collection, domain);
  }

  /**
   * mapRelMakeModelParts()
   *
   * @param {String} map
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapRelMakeModelParts(map, collection, domain) {
    return this.map(map, collection, domain);
  }

  /**
   * mapRelYearMakeModelParts()
   *
   * @param {String} map
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapRelYearMakeModelParts(map, collection, domain) {
    return this.map(map, collection, domain);
  }


  /**
   * mapSingle()
   *
   * @param {Object} collection
   * @param {String} key
   * @param {String} domain
   * @param {Object} options
   *
   * @return array
   */
  mapSingle(collection, key, domain, options) {
    const self = this;
    const parts = [];
    const urlPrefix = _.get(options, 'url.prefix', '');
    const urlSuffix = _.get(options, 'url.suffix', '');

    if (!_.isObject(collection) || key === '') {
      return parts;
    }

    _.each(collection, (item) => {
      const record = {};
      const partName = _.get(item, key) || '';
      _.set(record, 'link', urlPrefix + self.url.encode([partName]) + urlSuffix);
      _.set(record, 'image', Image.url(partName, domain));
      _.set(record, 'text', `${_.upperFirst(partName)}`);

      parts.push(record);
    });

    return parts || [];
  }

  /**
   * mapMakes()
   *
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapMakes(collection, domain) {
    const options = {
      url: {
        prefix: '/makes',
        suffix: '',
      },
    };

    return this.mapSingle(collection, 'make', domain, options);
  }

  /**
   * mapParts()
   *
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapParts(collection, domain) {
    return this.mapSingle(collection, 'part_name', domain);
  }

  /**
   * mapBrands()
   *
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapBrands(collection, domain) {
    return this.mapSingle(collection, 'brand_name', domain);
  }

  /**
   * mapYearsToPartMakeModel()
   *
   * @param {String} part
   * @param {String} make
   * @param {String} model
   * @param {Object} collection
   * @param {String} domain
   *
   * @return array
   */
  mapYearsToPartMakeModel(collection, part, make, model, domain) {
    const pmmy = [];

    if (part === '' || make === '' || model === '' || domain === '' || !_.isObject(collection)) {
      return pmmy;
    }

    _.each(collection, (year) => {
      const record = {};
      _.set(record, 'link', `/${seoEncode(decodeURIComponent(part))}/`
                            + `${seoEncode(decodeURIComponent(make))}/`
                            + `${seoEncode(decodeURIComponent(model))}/`
                            + `${seoEncode(decodeURIComponent(year))}`);
      _.set(record, 'text', `${year}`);

      pmmy.push(record);
    });

    return pmmy;
  }

  mapYearsToPartMakeModelQueryParams(collection, part, queryParams) {
    const pmmy = [];

    _.each(collection, (year) => {
      const record = {};
      const yearMakeModelParam = merge({ year }, queryParams);

      _.set(record, 'link', `/${seoEncode(decodeURIComponent(part))}?`
                          + `${queryString.stringify({ vehicle: yearMakeModelParam }, { encode: false })}`);
      _.set(record, 'text', `${year}`);

      pmmy.push(record);
    });

    return pmmy;
  }
}

export default Formatter;
