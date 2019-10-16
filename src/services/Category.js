import _ from 'lodash';
import queryString from 'qs';
import ApiService from './ApiService';
import TIMEOUTS from '../configs/timeouts';
import { urls, cache } from '../configs/services';
import operationKeys from '../configs/services/operation-keys';
import CategoryTransformer from '../transformers/CategoryTransformer';
import CacheInstance from '../core/Cache';
import ApiError from '../errors/classes/ApiError';
import Seo from './Seo';
import { compositeErrorHandler } from '../errors/handlers';

export default class Category extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.transformer = new CategoryTransformer();
    this.cache = CacheInstance;
    this.seo = new Seo();
    this.http = this._getClient(TIMEOUTS.CATALOG_2);
  }

  /**
   * Get categories from hydra cluster.
   *
   * @returns {Object<Promise>}
   */
  get() {
    return this.cache.remember('get_categories', cache.GET_CATEGORIES, () => this._get(
      urls.CATALOG_2,
      this._getCategoryQuery(),
      operationKeys.GET_CATEGORIES,
      this._transformerWithImage(this.transformer, 'untilCategories'),
    ));
  }

  /**
   * shopByCategories node.
   *
   * @returns {Object<Promise>}
   */
  getHomeCategory() {
    return this.cache.remember('get_home_categories', cache.GET_CATEGORIES, () => this._get(
      urls.CATALOG_2,
      this._getCategoryQuery(),
      operationKeys.GET_CATEGORIES,
      this._transformerWithImage(this.transformer, 'homeCategories'),
    ));
  }

  getVLP(ymmse, response, domain) {
    return new Promise((resolve, reject) => {
      const { year, make, model } = response.req.query;
      if (year === '' || make === '' || model === '') {
        reject(new ApiError('YMM is required', 400, 400));
      }
      this._get(
        urls.CATALOG_2,
        this._getCategoryVLPQuery(ymmse),
        operationKeys.GET_CATEGORIES,
        this._transformerWithImage(this.transformer, 'transformVLP'),
      ).then(async (result) => {
        const seo = this.seo.setDomain(domain);
        const staticData = await seo.getStaticDataContent().catch(compositeErrorHandler);
        const category = this._arrangeCategories(result, staticData.categoryOrders);
        resolve(category);
      });
    });
  }

  _arrangeCategories(categories, categoryList) {
    const newDataCategory = [];
    _.forEach(categoryList, (list) => {
      _.forEach(categories, (data) => {
        const categoryData = data;
        if (categoryData.text === list) {
          newDataCategory.push(categoryData);
        }
      });
    });

    return newDataCategory;
  }

  /**
   * Get top tier category based on the desire category
   * @param category
   * @param ymmse
   * @returns {Object<Promise>}
   */
  getTopTier(category = 'all', ymmse = '') {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        this._getTopTierQuery(category, ymmse),
        operationKeys.GET_CATEGORIES,
        this._transformerWithImage(this.transformer, 'collection'),
      ).then((result) => {
        const transform = this._transformerWithImage(this.transformer, '_transformWidgetTopTier');
        const dataResult = transform(result);
        resolve(dataResult);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  getCategoryPart(topTier, secondTier, ymmse = '') {
    return new Promise((resolve, reject) => {
      this._get(
        urls.CATALOG_2,
        this._getCategoryPartsQuery(topTier, secondTier, ymmse),
        operationKeys.GET_CATEGORIES,
        this._transformerWithImage(this.transformer, 'collection'),
      ).then((result) => {
        const transform = this._transformerWithImage(this.transformer, '_transformCategoryPart');
        const dataResult = transform(result);
        resolve(dataResult);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  getUrlSource(slug) {
    return new Promise((resolve, reject) => {
      this._get(
        urls.SEO36,
        this._getUrlSourceLookupQuery(slug),
        operationKeys.SEO.URL_SOURCE_LOOKUP,
        this._transformerWithImage(this.transformer, 'transformLookUp'),
        TIMEOUTS.SEO,
      ).then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Query string for the get category url
   *
   * @returns {String}
   */
  _getCategoryQuery() {
    const operation = operationKeys.GET_CATEGORIES;

    return queryString.stringify({
      op: JSON.stringify({
        [operation]: { type: 'related' },
      }),
      data: JSON.stringify({
        catalogSource: 'productlookupdb',
        site: this.getDomain(operation),
        rank: 'msv_30',
        section: 'category',
        all: 1,
      }),
    }, { encode: false });
  }

  /**
   * Query string for the get category url VLP
   *
   * @returns {String}
   */
  _getCategoryVLPQuery(ymmse) {
    const operation = operationKeys.GET_CATEGORIES;

    return queryString.stringify({
      op: JSON.stringify({
        [operation]: { type: 'related' },
      }),
      data: JSON.stringify({
        catalogSource: 'productlookupdb',
        site: this.getDomain(operation),
        rank: 'msv_30',
        section: 'category',
        all: 1,
        ...ymmse,
      }),
    }, { encode: true });
  }

  /**
   * Get Related Categories.
   *
   * @param {String} selectedPart
   * @param {Array} params
   *
   * @return {Object<Promise>}
   */
  relatedCategories(selectedPart, params) {
    return new Promise((resolve, reject) => {
      if (!selectedPart) {
        return resolve([]);
      }

      const operation = operationKeys.GET_RELATEDCATEGORIES;
      const data = {
        site: this.getDomain(operation),
        rel_part: selectedPart,
      };

      if (_.isUndefined(params.year)) {
        data.year = params.year;
      }

      if (!_.isUndefined(params.make)) {
        data.make = params.make;
      }

      if (!_.isUndefined(params.model)) {
        data.model = params.model;
      }

      const query = queryString.stringify({
        op: operation,
        data: JSON.stringify(data),
      }, { encodeValuesOnly: true });

      return this._get(urls.CATALOG_2, query, operation)
        .then(result => resolve(
          this.transformer.transformRelatedCategories(result, this.getDomain(operation), params),
        ))
        .catch(error => reject(error));
    });
  }

  /**
   * Retrieve Category Parts
   *
   * @param data
   *
   * @returns {Object<Promise>}
   */
  getCategoryParts(data) {
    return this._get(
      urls.CATALOG_2,
      this._getCategoryPartsQuery(data),
      operationKeys.GET_CATEGORY_PART,
      this._transformerWithImage(this.transformer, '_transformCategoryParts'),
    );
  }

  /** Query string for Top Tier Category
   * @param category
   * @param ymmse
   * @returns {string|*}
   * @private
   */
  _getTopTierQuery(category = 'all', ymmse) {
    const operation = operationKeys.GET_CATEGORIES;
    const data = {
      catalogSource: 'productlookupdb',
      site: this.getDomain(operation),
      format: 'print_r',
      rank: 'msv_30',
      section: 'category',
      insertBrand: 1,
      all: 1,
      topLevel: [category],
      ...ymmse,
    };

    return queryString.stringify({
      op: JSON.stringify({
        [operation]: { type: 'related' },
      }),
      data: JSON.stringify(data),
    }, { encode: true });
  }

  _getUrlSourceLookupQuery(slug) {
    const operation = operationKeys.SEO.URL_SOURCE_LOOKUP;
    const data = {
      site: this.getDomain(operation),
      source: 'cms-curl',
      prettyUrl: slug,
    };

    return queryString.stringify({
      op: operation,
      data: JSON.stringify(data),
      format: 'json',
    }, { encode: true });
  }

  /**
   * Query for Get Category Parts.
   * @param topLevel
   * @param secondLevel
   * @param ymmse
   * @returns {string|*}
   * @private
   */
  _getCategoryPartsQuery(topLevel, secondLevel, ymmse) {
    try {
      const operation = operationKeys.GET_CATEGORIES;
      const data = {
        catalogSource: 'productlookupdb',
        site: this.getDomain(operation),
        format: 'print_r',
        rank: 'msv_30',
        section: 'category',
        insertBrand: 1,
        all: 1,
        flatPartName: 1,
        topLevel: [topLevel],
        '2ndLevel': [secondLevel],
        ...ymmse,
      };

      return queryString.stringify({
        op: JSON.stringify({
          [operation]: { type: 'related' },
        }),
        data: JSON.stringify(data),
      }, { encode: true });
    } catch (error) {
      return error;
    }
  }
}
