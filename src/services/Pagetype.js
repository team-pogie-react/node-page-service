import _ from 'lodash';
import queryString from 'qs';
import sequelize from 'sequelize';
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
  getData(uri, tid) {
    const params = {
      site: this.getDomain(),
      request_url: uri,
      tid,
    };

    if (/^\/details/.test(uri)) {
      params.pdppla = 1;
    }

    const query = queryString.stringify(params, { encodeValuesOnly: true });
    const cacheKey = `get_page_type_${this.cache.generateKey(JSON.stringify(params))}`;

    return this.cache.remember(cacheKey, cache.GET_PAGE_TYPE, () => this._get(
      urls.PAGE_TYPE,
      query,
      ['contents', 'attributes', 'page_type', 'status_code', 'request_url', 'redirect_url'],
      null,
      TIMEOUTS.SEO_NEXUS,
    ).then((response) => {
      if (response.status_code !== 200) {
        return response;
      }

      let articleHeading = '';

      if (response.page_type === 'category') {
        articleHeading = _.get(response, 'attributes.cat.category_name',
          _.get(response, 'attributes.tlc.category_name', ''));
      } else {
        _(response.attributes).keys().each((key) => {
          const nodeName = `${key}_name`;
          const attrValue = _.get(response.attributes[key], nodeName, '');
          articleHeading += `${attrValue} `;
        });
      }

      _.set(response, 'articles.data', this.pageTransformer.transformArticles(response));
      _.set(response, 'articles.header', `${articleHeading.trim()} Articles`);

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
        { replacements: { data: data[i] }, type: sequelize.QueryTypes.SELECT },).then((result) => {
        consoler('result', result);
      });
      i += 1;
    });
  }
}// end class
