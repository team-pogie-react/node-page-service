import _ from 'lodash';
import queryString from 'qs';
import md5 from 'md5';
import Promise from 'bluebird';
import CacheInstance from '../core/Cache';
import SeoApiService from './SeoApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import PageTransformer from '../transformers/PageTransformer';
import {
  consoler, decode, engineDecode, seoEncode,
} from '../core/helpers';


const {
  Makes, Models, Partnames, Brands, Category, Toplevel,
  Engines, Submodels, Sku, Years,
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
  getData(uri) {
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


  async getAttributes(patternList, data) {
    let serialPattern;
    const presponse = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < patternList.length; ++i) {
      serialPattern = patternList[i].split('_');

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
    consoler('serialPattern', serialPattern);

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
    _.forEach(serialPattern, (table) => {
      tablesList.push(table);

      switch (table) {
        case 'engines':
          engineData = engineDecode(data[i]);
          if (engineData.length === 2) {
            promiseList.push(modelMappings[table].findOne({
              where: { cylinders: engineData[0], liter: engineData[1] },
            }));
          }
          break;

        case 'sku':
          promiseList.push(modelMappings[table].findOne({
            where: { [fieldMappings[table]]: decode(data[i]) },
          }));
          break;

        default:
          promiseList.push(modelMappings[table].findOne({
            where: { [fieldMappings[table]]: decode(data[i]) },
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
        if (dbres && dbres !== null && dbres.dataValues) {
          consoler('dbres', dbres._modelOptions.name.plural);

          attributes.push(dbres.dataValues);
        }
      });

      if (serialPattern.length === attributes.length) {
        consoler('validatePattern', attributes);

        return attributes;
      }

      return [];
    } catch (error) {
      consoler('ERROR on ', error);

      return error;
    }
  }
}// end class
