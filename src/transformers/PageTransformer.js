import _ from 'lodash';
import { isFalsy } from '../core/helpers';

export default class PageTransformer {
  /**
   * Transform Page Type api response.
   *
   * @param {Object} result
   *
   * @return {Object}
   */
  attributes(result) {
    return result;
  }

  /**
   * Retrieve the page related data such as attributes and articles
   *
   * @param {Object} result
   *
   * @return {Object}
   */
  transformArticles(result) {
    let res = [];

    _.each(result, (item, key) => {
      if (key === 'contents') {
        res = this._transformContents(item, 'pimcore_data');
      }
    });

    return res;
  }

  /**
   * Retrieve the page related data such as attributes and articles
   *
   * @param {Object} result
   *
   * @return {Object}
   */
  _transformArticleArray(result) {
    return result;
  }

  /**
   * Get header from page service
   *
   * @param {Object} result
   *
   * @return {String}
   */

  transformHeaderTitle(result) {
    let headerTitle = '';

    if (result.page_type === 'category') {
      headerTitle = _.get(result, 'attributes.cat.cat_category_name',
        _.get(result, 'attributes.tlc.tlc_category_name', ''));
    } else {
      _.each(result.contents.pimcore_data.elements, (element) => {
        if (element.name === 'header_name') {
          headerTitle = !isFalsy(element.value.text) ? element.value.text : '';
        }
      });
    }

    return headerTitle;
  }

  /**
   * Transform article content block.
   *
   * @param {Object<Array>} collection
   * @param {String} node
   *
   * @returns {Array<Object>}
   */
  _transformContents(collection, node) {
    if (!_.isObject(collection)) {
      return [];
    }

    const result = [];
    const tmpResult = {};
    const data = collection[node];
    const searchKey = 'article_block';

    if (!data) {
      return [];
    }

    const { elements } = data;

    _.each(elements, (item) => {
      const isSeoContent = _.get(item, 'name') === 'seo_content';
      const nameNode = item.name.split(searchKey);

      if (isSeoContent) {
        _.set(tmpResult, '0.title', '');
        _.set(tmpResult, '0.text', _.get(item, 'value.text') || '');

        return;
      }


      if (nameNode.length !== 2) {
        // We only need the result to be 2. Example
        // name = 'titlearticle_block1'
        // after split we expect the array to contain [title, 1]
        return;
      }

      const title = nameNode[0];
      const group = nameNode[1];

      if (!(group in tmpResult) && title !== '') {
        tmpResult[group] = {};
      }

      if (title === 'title') {
        tmpResult[group].title = item.value.text;
      } else if (title === 'body') {
        tmpResult[group].text = item.value.text;
      }
    });

    // TODO: Find better way to assign the collection of objects to the array
    _.each(tmpResult, (res) => {
      result.push(res);
    });

    return result;
  }

  /**
   * Transform collection base from key.
   *
   * @param {Object<Array>} collection
   * @param {String} key
   *
   * @returns {Array}
   */
  _transform(collection, key) {
    if (!_.isObject(collection)) {
      return [];
    }


    const result = [];
    const obj = {};

    _.each(collection, (item) => {
      if (key instanceof Array) {
        // Build the object element first before outputing
        key.forEach((element) => {
          if (element in item) {
            obj[element] = item;
            key.splice(key.indexOf(element), 1);
          }
        });
      } else {
        result.push(item);
      }
    });
    if (key instanceof Array) {
      result.push(obj);
    }

    return result;
  }
}
