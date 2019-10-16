import _ from 'lodash';
import SeoTransformer from './SeoTransformer';
import { getLinkByPageAttr, getTextByPageAttr } from '../core/helpers';
import Image from '../core/Image';

export default class CatalogTransformer extends SeoTransformer {
  /**
   * Transform Refinements api response.
   *
   * @param {Object} data
   *
   * @returns {Array}
   */
  refinements(data) {
    return _.get(data, 'value.getRefinements.value', {});
  }

  /**
   * Transform relatedParts api response.
   *
   * @param {Object} data
   * @param {Object} pageAttr
   *
   * @returns {Array}
   */
  relatedParts(data, domain, pageAttr) {
    const parts = [];
    const attr = pageAttr;

    _.each(data.data, (obj) => {
      _.each(obj, (item) => {
        attr.brand = item;
        parts.push({
          text: getTextByPageAttr(attr),
          image: Image.url(item, domain),
          link: getLinkByPageAttr(attr),
        });
      });
    });

    return parts;
  }

  /**
   * Transform relatedParts api response by make.
   *
   * @param {Object} data
   * @param {Object} pageAttr
   *
   * @returns {Array}
   */
  relatedPartsByMake(data, domain, pageAttr) {
    const parts = [];
    const attr = pageAttr;

    _.each(data.data, (obj) => {
      _.each(obj, (item) => {
        attr.make = item;
        parts.push({
          text: getTextByPageAttr(attr),
          image: Image.url(item, domain),
          link: getLinkByPageAttr(attr),
        });
      });
    });

    return parts;
  }

  /**
   * Transform relatedParts api response.
   *
   * @param {Object} data
   * @param {Object} pageAttr
   *
   * @returns {Array}
   */
  shopByParts(data, domain, pageAttr) {
    const parts = [];
    const attr = pageAttr;

    _.each(data.data, (obj) => {
      _.each(obj, (item) => {
        attr.part = item;
        parts.push({
          text: item,
          image: Image.url(item, domain),
          link: getLinkByPageAttr(attr),
        });
      });
    });

    return parts;
  }

  /**
   * Transform getProducts api response.
   *
   * @param {Object} data
   * @param {String} domain
   *
   * @returns {Array}
   */
  getProducts(collection, domain) {
    return _.isObject(collection) ? this._transformProducts(collection, domain) : {};
  }

  /**
   * Transform getCategories api response.
   *
   * @param {Object} data
   *
   * @returns {Array}
   */
  getCategories(collection) {
    return _.isArray(collection) ? collection : [];
  }
}
