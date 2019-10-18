import _ from 'lodash';
import queryString from 'qs';
import sequelize from 'sequelize';
import md5 from 'md5';
import CacheInstance from '../core/Cache';
import SeoApiService from './SeoApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import PageTransformer from '../transformers/PageTransformer';
import { consoler } from '../core/helpers';


export default class Pagetype extends SeoApiService {
  /** @interitdoc */
  constructor() {
    super();

    this.cache = CacheInstance;
    this.pageTransformer = new PageTransformer();
    this.sequelize = new sequelize('ProductLookupDb_merge_optimized', 'hydra', 'gh56vn', {
      host: '10.10.75.236',
      dialect: 'mysql',
    });
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


  getAttributes(patternList, data) {
    let validAttirb;

    _.forEach(patternList, (pattern) => {
      const serialPattern = pattern.split('_');
      // validAttirb = this.validatePattern(serialPattern, data);
    });

    consoler('data', data);

    return validAttirb;
  }

  validatePattern(serialPattern, data) {
    let i = 0;
    _.forEach(serialPattern, (table) => {
      // consoler(table, data[i]);
      this.sequelize.query(`SELECT ${table}_name, ${table}_id FROM ${table}s WHERE ${table}_name = :data`,
        { replacements: { data: data[i] }, type: sequelize.QueryTypes.SELECT }).then((result) => {
        consoler('result', result);
      });
      i += 1;
    });
  }
}// end class
