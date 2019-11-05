import _ from 'lodash';
import queryString from 'qs';
import md5 from 'md5';
import Promise from 'bluebird';
import CacheInstance from '../core/Cache';
import SeoApiService from './SeoApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import PageTransformer from '../transformers/PageTransformer';
import Pagemap from '../configs/services/pagemap';
import {
  consoler, decode, engineDecode,
} from '../core/helpers';

const {
  Makes, Models, Partnames, Brands, Category, Toplevel,
  Engines, Submodels, Sku, Years, sequelize,
} = require('../core/Db').default;

export default class Pagetype extends SeoApiService {
  /** @interitdoc */
  constructor() {
    super();

    this.cache = CacheInstance;
    this.pageTransformer = new PageTransformer();
  }


  /**
   * Get page data.
   *
   * @param {String} uri
   * @param {String} tid
   *
   * @returns {Object<Promise>}
   */
  getRedirectorData(uri) {
    // hash_code = md5(strtolower(rtrim($params['request_url'], "/")))
    let redirectorUri;

    redirectorUri = uri;
    if (uri.charAt(uri.length) === '/') {
      redirectorUri = redirectorUri.substr(uri.length);
    }
    redirectorUri = redirectorUri.toLowerCase();
    redirectorUri = md5(redirectorUri);
    const params = {
      site: this.getDomain(),
      hash_code: redirectorUri,
    };
    consoler('params', params);
    const query = queryString.stringify(params, { encodeValuesOnly: true });
    const cacheKey = `get_page_type_${this.cache.generateKey(JSON.stringify(params))}`;

    return this.cache.remember(cacheKey, cache.GET_PAGE_TYPE, () => this._get(
      urls.REDIRECTOR,
      query,
      ['contents', 'attributes', 'page_type', 'status_code', 'request_url', 'redirect_url'],
      null,
      TIMEOUTS.SEO_NEXUS,
    ).then((response) => {
      if (response.status_code !== 200) {
        return response;
      }

      return response;
    }));
  }


  /**
   * Get page data.
   *
   * @param {String} uri
   * @param {String} tid
   *
   * @returns {Object<Promise>}
   */
  getPimcoreData(uri) {
    // sample: http://api3ns-staging.usautoparts.com/Contents/v1.0/getcontents?source=doc&path=/carparts.com/make/ford&apikey=anzhbnJvaXVz

    const params = {
      source: 'doc',
      path: uri,
      apikey: 'anzhbnJvaXVz',
    };

    const query = queryString.stringify(params, { encodeValuesOnly: false });
    const cacheKey = `get_page_type_${this.cache.generateKey(JSON.stringify(params))}`;

    return this.cache.remember(cacheKey, cache.GET_PAGE_TYPE, () => this._get(
      urls.SEO_CONTENTS,
      query,
      ['contents', 'attributes', 'page_type', 'status_code', 'request_url', 'redirect_url'],
      null,
      TIMEOUTS.SEO_NEXUS,
    ).then((response) => {
      if (response.success) {
        consoler(' getPimcoreData response', response);

        return response;
      }

      return response;
    }));
  }

  /**
   * Get page data.
   *
   * @param {String} uri
   * @param {String} tid
   *
   * @returns {Object<Promise>}
   */
  getCatalogData(uri) {
    // catalog: https://api3-staging.usautoparts.com/v1.0/Catalog2/?apikey=anzhbnJvaXVz&op=getProducts&data={"catalogSource":"Endeca","pipeDelimited":"0","site":"carparts.com","brand":"Replacement","part":"Bumper"}

    // catalog: http://api3ns-staging.usautoparts.com/v1.0/Catalog2/?op=getProducts&data[catalogSource]=Endeca&data[pipeDelimited]=0&data[site]=carparts.com&data[brand]=Replacement&data[part]=Bumper&apikey=anzhbnJvaXVz

    const uriParam = [];

    _.forEach(uri, (data) => {
      let i = 0;
      _.forEach(data, (values, key) => {
        if (i === 1) {
          const keyVar = key.replace('_name', '');
          uriParam[keyVar] = values;
        }
        i += 1;
      });
    });

    const dataParam = {
      catalogSource: 'Endeca',
      pipeDelimited: '0',
      site: this.getDomain(),
      navParams: '{"limit":1}',
      ...uriParam,
    };

    const params = {
      op: 'getProducts',
      data: dataParam,
      apikey: 'anzhbnJvaXVz',
    };
    consoler('params', params);
    const query = queryString.stringify(params, { encodeValuesOnly: false });
    const cacheKey = `get_page_type_${this.cache.generateKey(JSON.stringify(params))}`;

    return this._get(
      urls.CATALOG_2,
      query,
      ['contents', 'attributes', 'page_type', 'status_code', 'request_url', 'redirect_url'],
      null,
      TIMEOUTS.SEO_NEXUS,
    ).then((response) => {
      if (response.getProducts && response.getProducts.value) {
        return response.getProducts.value.MetaInfo['Total Number of Matching Records'];
      }

      return response;
    });
  }

  async getAttributes(patternList, data) {
    let serialPattern;
    const presponse = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < patternList.length; ++i) {
      serialPattern = patternList[i].split('_');

      consoler('serialPattern', serialPattern);
      try {
        // eslint-disable-next-line no-await-in-loop
        const presult = await Promise.all(this.validatePattern(serialPattern, data))
          .then(([...attributes]) => Promise.resolve({
            attributes,
          }));

        if (presult && presult.attributes && presult.attributes.length > 0) {
          presult.serialPattern = patternList[i];
          presponse.serialPattern = presult.serialPattern;
          presponse.attributes = presult.attributes;
          consoler('presponse', presponse);

          return presult;
        }
      } catch (error) {
        consoler('presult ERROR on ', error);

        return error;
      }
    }

    return [];
  }


  async validatePattern(serialPattern, data) {
    let i = 0;
    const attributes = [];

    const modelMappings = {
      makes: Makes,
      models: Models,
      partnames: Partnames,
      brands: Brands,
      category: Category,
      toplevel: Toplevel,
      engines: Engines,
      submodels: Submodels,
      sku: Sku,
      years: Years,
    };

    const fieldMappings = {
      makes: 'make_name',
      models: 'model_name',
      partnames: 'part_name',
      brands: 'brand_name',
      category: 'cat_name',
      toplevel: 'tlc_name',
      engines: 'cylinders',
      submodels: 'submodel_name',
      sku: 'sku',
      years: 'year',
    };

    const promiseList = [];
    const tablesList = [];
    let engineData = [];

    let tlcMapData = [];
    let tlcMapKey = [];

    // check if the pattern is a category type
    if (serialPattern[0] === 'toplevel' || serialPattern[0] === 'category') {
      // check on tlcMapKey for mapping
      tlcMapKey = await this.cache.get('tlcMapkey');
      if (tlcMapKey) {
        tlcMapData = JSON.parse(JSON.stringify(tlcMapKey));
      }
    }

    _.forEach(serialPattern, async (table) => {
      tablesList.push(table);

      // TODO Improve the decoding mapping
      let varData = decode(data[i]);
      const varDataMapped = Pagemap[varData];
      

      if (tlcMapData[varData]) {
        varData = tlcMapData[varData];
      } else if (varDataMapped) {  
        varData = varDataMapped;
      } else {
        varData = varData.replace(/-/g, ' ');
        varData = varData.replace(/_/g, ' ');
      }

      consoler('varData', varData);

      switch (table) {
        case 'engines':
          engineData = engineDecode(data[i]);
          consoler('engineData', data[i]);
          consoler('engineData', engineData);
          if (engineData.length === 2) {
            promiseList.push(modelMappings[table].findOne({
              where: { cylinders: engineData[0], liter: engineData[1] },
            }));
          }
          break;

        case 'category':
          promiseList.push(sequelize.query(`SELECT category.cat_id, category.cat_name, toplevel_category.tlc_id, toplevel_category.tlc_name FROM category join category_toplevel on category.cat_id = category_toplevel.cat_id join toplevel_category on toplevel_category.tlc_id = category_toplevel.tlc_id WHERE category.cat_name = '${varData}' LIMIT 1;`));
          break;

        case 'sku':
          promiseList.push(modelMappings[table].findOne({
            where: { [fieldMappings[table]]: varData },
          }));
          break;

        default:
          consoler(`default promiseList for ${table}`, varData);
          promiseList.push(modelMappings[table].findOne({
            where: { [fieldMappings[table]]: varData },
          }));
      }

      i += 1;
    });


    try {
      const presult = await Promise.all(promiseList)
        .then(([...presults]) => Promise.resolve({
          presults,
        }));

      _.forEach(presult.presults, (dbres) => {
        //  consoler('dbres', dbres);
        if (dbres && dbres !== null && dbres.dataValues) {
          attributes.push(dbres.dataValues);
        }
        // this means it came from raw queries
        if (dbres && dbres !== null && !dbres.dataValues) {
          consoler('dbres[0]', ...dbres[0]);
          attributes.push(...dbres[0]);
        }
      });

      consoler('validatePattern', attributes);
      if (serialPattern.length === attributes.length) {
        return attributes;
      }

      return [];
    } catch (error) {
      consoler('ERROR on validatePattern', error);

      return error;
    }
  }
}// end class
