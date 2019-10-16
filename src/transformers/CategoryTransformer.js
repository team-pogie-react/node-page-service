import _ from 'lodash';
import { seoEncode, getTextByPageAttr } from '../core/helpers';
import Image from '../core/Image';

export default class CategoryTransformer {
  /**
   * Transform category collection api response.
   *
   * @param {Object} categories
   * @param {String} domain
   *
   * @returns Array
   */
  collection(categories, domain) {
    if (!_.isObject(categories)) {
      return [];
    }

    return this._transformLevel(categories, domain);
  }

  /**
   * Transform items until categories deep.
   *
   * @param {Object} items
   * @param {String} domain
   *
   * @returns {Array}
   */
  untilCategories(items, domain) {
    if (!_.isObject(items)) {
      return [];
    }

    const result = [];

    _.each(items, (set, name) => {
      const sub = { text: name };

      sub.link = `/${seoEncode(name)}`;
      sub.categories = this._transformCategories(set, name, domain);

      result.push(sub);
    });

    return result;
  }

  homeCategories(items, domain) {
    if (!_.isObject(items)) {
      return [];
    }

    const maxResult = 8;
    const result = [];

    _.each(items, (set, name) => {
      const sub = { text: name };

      sub.link = `/${seoEncode(name)}`;
      sub.categories = this._transformCategories(set, name, domain, maxResult);

      result.push(sub);
    });

    return result;
  }

  transformVLP(items, domain) {
    if (!_.isObject(items)) {
      return [];
    }

    const result = [];

    _.each(items, (set, name) => {
      const sub = { text: name };

      sub.link = `/${seoEncode(name)}`;
      sub.categories = this._transformCategoriesForVLP(set, name, domain);

      result.push(sub);
    });

    return result;
  }

  /**
   * Transform category part api response
   * @param collection
   * @returns {*}
   * @private
   */
  _transformCategoryParts(collection) {
    if (!_.isObject(collection)) {
      return [];
    }

    const categoryPart = collection.value.Catpart.link;
    const catalogTypeTabs = collection.value.catalogTypeTabs.value;
    const result = {
      categoryPart: [],
      catalogTypeTabs: [],
    };
    // Consolidate Category Parts
    _.each(categoryPart, (set, name) => {
      result.categoryPart.push({
        [name]: set,
      });
    });
    // Consolidate Catalog Type Tabs
    _.each(catalogTypeTabs, (set, name) => {
      result.catalogTypeTabs.push({
        [name]: set,
      });
    });

    return result;
  }

  /**
   * Transform the categories by level recursively.
   * We reassign the "level" param to "lvl" prevent
   *
   * @param {Object|Array} collection
   * @param {String} domain
   * @param {Integer} level
   *
   * @returns {Array}
   */
  _transformLevel(collection, domain, level = 1) {
    const result = [];
    const subLevelKey = this._getSubLevelKey(level);

    _.each(collection, (set, name) => {
      const sub = { text: name };

      if (_.isObject(set)) {
        sub.image = Image.url(name, domain);
        sub[subLevelKey] = this._transformLevel(set, domain, level + 1);
      }

      if (_.isArray(set)) {
        sub[subLevelKey] = this._transformSubLevel(set, domain);
      }

      result.push(sub);
    });

    return result;
  }

  /**
   * Transform category.
   *
   * @param {Array} collection
   * @param {String} topCategory
   * @param {String} domain
   * @param {Integer} maxResult
   *
   * @returns {Array<Object>}
   */
  _transformCategories(collection, topCategory, domain, maxResult) {
    const result = [];
    let ctr = 0;
    _.each(collection, (key, value) => {
      result.push({
        text: value,
        image: Image.url(value, domain),
        link: `/${seoEncode(value)}`,
      });
      ctr += 1;
      if (ctr >= maxResult && maxResult !== 0) {
        return false;
      }

      return true;
    });

    return result;
  }

  _transformCategoriesForVLP(collection, topCategory, domain) {
    const result = [];
    _.each(collection, (key, value) => {
      result.push({
        text: value,
        image: Image.url(value, domain),
        link: `/${seoEncode(value)}`,
      });
    });

    return result;
  }

  /**
   * Transform sub level category.
   *
   * @param {Array} collection
   * @param {String} domain
   *
   * @returns {Array<Object>}
   */
  _transformSubLevel(collection, domain) {
    const result = [];

    _.each(collection, (name) => {
      result.push({
        text: name,
        image: Image.url(name, domain),
      });
    });

    return result;
  }

  /**
   * Get the key to use for the category sub level.
   *
   * @param {Integer} level
   *
   * @returns {String|Null}
   */
  _getSubLevelKey(level) {
    switch (level) {
      case 1:
        return 'categories';
      case 2:
        return 'subcategories';
      case 3:
        return 'partnames';
      default:
        return null;
    }
  }

  _transformWidgetTopTier(data) {
    const result = [];
    if (data.length < 1) {
      return result;
    }
    _.forEach(data[0].categories, (item) => {
      const { text, image } = item;
      const link = `/${seoEncode(text)}`;
      result.push({
        text,
        image,
        link,
      });
    });

    return result;
  }

  _transformCategoryPart(data) {
    const result = [];
    _.forEach(data[0].categories[0].subcategories, (parts) => {
      const { text, image } = parts;
      const txt = _.get(parts, 'partnames.0.text', text);
      const link = `/${seoEncode(txt)}`;
      result.push({
        text,
        image,
        link,
      });
    });

    return result;
  }

  transformLookUp(data) {
    return data;
  }

  /**
   * Transform related catgories.
   *
   * @param {Array} categories
   * @param {String} domain
   * @param {Array} params
   *
   * @returns {Array}
   */
  transformRelatedCategories(categories, domain, params) {
    const result = [];
    const attr = params;

    _.each(categories, (name) => {
      const url = this._createUrl(name.part_name, params);
      attr.part = name.part_name;

      result.push({
        text: getTextByPageAttr(attr),
        link: url,
        image: Image.url(name.part_name, domain),
      });
    });

    return result;
  }

  /**
   * Transform related catgories.
   *
   * @param {Array} result
   * @param {String} domain
   * @param {Array} dataParams
   *
   * @returns {Array}
   */

  transformShopByModels(result, dataParams) {
    const data = _.get(result, 'data', []);
    const response = [];

    _.each(data, (item) => {
      _.set(dataParams, 'part', item.part_name);
      _.set(dataParams, 'model', item.model);

      response.push({
        text: getTextByPageAttr(dataParams),
        link: this._createUrl(item.part_name, dataParams),
      });
    });

    return response;
  }

  /**
   * Constract categories url.
   *
   * @param {String} category
   * @param {Array} params
   *
   * @returns {String}
   */
  _createUrl(category, params) {
    let url = `/${seoEncode(category)}`;

    if (!_.isUndefined(params.year)) {
      url += `/${seoEncode(params.year)}`;
    }

    if (!_.isUndefined(params.make)) {
      url += `/${seoEncode(params.make)}`;
    }

    if (!_.isUndefined(params.model)) {
      url += `/${seoEncode(params.model)}`;
    }

    return url;
  }
}
