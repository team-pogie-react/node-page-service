import _ from 'lodash';
import queryString from 'qs';
import md5 from 'md5';
import Promise from 'bluebird';
import CacheInstance from '../core/Cache';
import SeoApiService from './SeoApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import PageTransformer from '../transformers/PageTransformer';
import { consoler } from '../core/helpers';


const {
  Makes, Models, Partnames, Brands, Category, TLC,
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
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < patternList.length; ++i) {
      serialPattern = patternList[i].split('_');

      // eslint-disable-next-line no-await-in-loop
      const presult = await Promise.all(this.validatePattern(serialPattern, data))
        .then(([...attributes]) => Promise.resolve({
          attributes,
        }));
      consoler('presult', presult);

      return presult.attributes;
    }

    return false;
    // consoler('serialPattern.length', serialPattern.length);
  }


  async validatePattern(serialPattern, data) {
    let i = 0;
    const attributes = [];
    // const PR = [];

    const modelMappings = {
      makes: Makes,
      models: Models,
      partnames: Partnames,
      brands: Brands,
      category: Category,
      toplevel: TLC,
    };

    const fieldMappings = {
      makes: 'make_name',
      models: 'model_name',
      partnames: 'part_name',
      brands: 'brand_name',
      category: 'cat_name',
      toplevel: 'tlc_name',
    };

    const promiseList = [];
    const tablesList = [];

    _.forEach(serialPattern, (table) => {
      tablesList.push(table);

      promiseList.push(modelMappings[table].findOne({
        where: { [fieldMappings[table]]: data[i] },
      }));
      i += 1;
    });

    try {
      const presult = await Promise.all(promiseList)
        .then(([...presults]) => Promise.resolve({
          presults,
        }));

      _.forEach(presult.presults, (dbres) => {
        if (dbres && dbres.dataValues) {
          attributes.push(dbres.dataValues);
        }
      });

      if (serialPattern.length === attributes.length) {
        return attributes;
      }

      return false;
    } catch (error) {
      consoler('ERROR', error);

      return error;
    }
  }
}// end class
