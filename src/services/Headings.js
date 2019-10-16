import { get } from 'lodash';
import ApiService from './ApiService';
import TIMEOUTS from '../configs/timeouts';
import { isFalsy } from '../core/helpers';
import { cache, urls } from '../configs/services';
import CacheInstance from '../core/Cache';

export default class Headings extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.cache = CacheInstance;
  }

  /**
   * Heading for shopByModels node.
   *
   * @param {String} modelName
   *
   * @returns {String}
   */
  shopByModels(modelName) {
    return `${modelName} Models`;
  }

  /**
   * Returned value for this is the same witht he page.header
   *
   * @param {String} partName
   *
   * @returns {String}
   */
  topParts(partName) {
    return partName;
  }

  /**
   * Articles header.
   *
   * @param {String} articleHeader
   *
   * @returns {String}
   */
  articles(articleHeader) {
    return articleHeader;
  }

  /**
   * Products node heading.
   *
   * @param {Object} attributes
   * @param {string} [stringAppend='']
   *
   * @returns {String}
   */
  products(attributes, stringAppend = '') {
    const productHeading = 'Shop';
    const attr = attributes;
    const stringParts = [];
    stringParts.push(productHeading);

    if ('brand' in attr && 'brand_name' in attr.brand) {
      stringParts.push(attr.brand.brand_name);
    }

    if ('year' in attr && 'year' in attr.year) {
      stringParts.push(attr.year.year);
    }

    if ('make' in attr && 'make_name' in attr.make) {
      stringParts.push(attr.make.make_name.trim());
    }

    if ('model' in attr && 'model_name' in attr.model) {
      stringParts.push(attr.model.model_name.trim());
    }

    if ('part' in attr && 'part_name' in attr.part) {
      stringParts.push(attr.part.part_name.trim());
    }

    stringParts.push(stringAppend);

    return `${stringParts.join(' ')}`.trim();
  }

  /**
   * Get value for header node
   *
   * @param {String} pageType
   * @param {Object} params
   *
   * @returns {Promise<Object|Null>}
   */
  getPageHeader(pageType, params) {
    const fn = () => new Promise((resolve, reject) => {
      if (pageType === 'category') {
        return resolve({ page: this.getCategoryPageHeader(params) });
      }

      const url = `${this.baseUrl}${urls.PAGE_HEADER}${pageType}`;
      const body = { site: this.getDomain(), data: params };

      return this._post(url, body, TIMEOUTS.SEO_NEXUS)
        .then((response) => {
          const { data } = response;

          if (isFalsy(data)) {
            return resolve(null);
          }

          const rawHeader = get(data, 'data.header', '');
          const header = decodeURIComponent(rawHeader).replace(/(<([^>]+)>)/ig, '');

          return resolve(Object.assign(data, { page: header }));
        })
        .catch(error => reject(error));
    });

    const cacheKey = this.cache.generateKey(JSON.stringify({ params }));

    return this.cache.remember(`get_page_header_${pageType}_${cacheKey}`, cache.GET_PAGE_HEADER, fn);
  }

  /**
   * Extract category page header.
   *
   * @param {Object} params
   *
   * @returns {String}
   */
  getCategoryPageHeader(params) {
    const defaultHeader = get(params, 'attributes.tlc.tlc_category_name', '');
    const header = get(params, 'attributes.cat.cat_category_name', defaultHeader)
      .replace(/(<([^>]+)>)/ig, '');

    return header;
  }
}
