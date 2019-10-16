import { _, merge } from 'lodash';
import {
  generateProductUri,
  getLinkByPageAttr,
  getTextByPageAttr,
  seoEncode,
} from '../core/helpers';
import Image from '../core/Image';
import Formatter from '../core/library/seo/url/formatter';

export default class SeoTransformer {
  /**
   * Create SeoTransformer instance
   */
  constructor() {
    this.formatter = new Formatter();
  }

  /**
   * Retrieve article data and transform it
   *
   * @param {Object} make
   *
   * @returns {Array<Object>}
   */
  article(makes) {
    return this._transform(makes, 'article');
  }

  /**
   * Retrieve the Categories and Products list
   *
   * @param {Object} results
   *
   * @returns {Array}
   */
  categoryProducts(results) {
    return this._transformCategoryProducts(results);
  }

  getCategories(results) {
    return results;
  }

  /**
   * Retrieve the Article Data
   *
   * @param {Object} results
   *
   * @returns {Array}
   */
  getArticleData(results) {
    return results;
  }

  /**
   * Retrieve the Article Data
   *
   * @param {Object} results
   *
   * @returns {Array}
   */
  getContents(results) {
    return results;
  }

  /**
   * Retrieve the SEO Year
   *
   * @param {Object} results
   * @param {Object} queryAttr
   * @param {Object} vehicleParams
   *
   * @returns {Array}
   */
  getSeoYear(results, queryAttr, vehicleParams) {
    const vehicleAttribute = merge({}, vehicleParams);

    if (_.isEmpty(vehicleAttribute)) {
      vehicleAttribute.make = _.get(queryAttr, 'make', '');
      vehicleAttribute.model = _.get(queryAttr, 'model', '');
    }

    const years = this.formatter.mapYearsToPartMakeModel(
      results,
      _.get(queryAttr, 'part', ''),
      _.get(queryAttr, 'make', ''),
      _.get(queryAttr, 'model', ''),
      _.get(queryAttr, 'site', ''),
    );
    // const years = this.formatter.mapYearsToPartMakeModelQueryParams(
    //   results,
    //   _.get(queryAttr, 'part', ''),
    //   vehicleAttribute,
    // );

    return years;
  }

  /**
   * Retrieve the top 40 parts
   *
   * @param {Object} results
   * @param {Object} pageAttr
   *
   * @returns {Object}
   */
  getTop40Parts(results, domain, pageAttr) {
    const topParts = [];
    const attr = pageAttr;

    _.each(results, (item) => {
      attr.part = item;
      topParts.push({
        text: getTextByPageAttr(attr),
        image: Image.url(item, domain),
        link: getLinkByPageAttr(attr),
      });
    });


    return topParts;
  }

  /**
   * Returns the related category result
   *
   * @param {Object} results
   *
   * @returns {Object}
   */
  getBrandPart(results) {
    const res = [];

    _.each(results, (item) => {
      res.push({
        text: item.part_name,
        image: '',
        link: '',
      });
    });

    return res;
  }

  /**
   * Returns the related category result
   *
   * @param {Object} results
   * @param {Object} pageAttr
   *
   * @returns {Object}
   */
  getMakeModel(results, pageAttr) {
    const res = [];
    const attr = pageAttr;

    _.each(results.data, (item) => {
      attr.model = item.model;
      res.push({
        text: `${getTextByPageAttr(attr)} Parts`,
        link: getLinkByPageAttr(attr),
      });
    });

    return res;
  }

  /**
   * Search for the product/listing/hose and everything thanks t from
   *
   * @param {Object} results
   *
   * @returns {Object}
   */
  search(results) {
    return this._transformRefinements(results.value.getRefinements.value);
  }

  /**
   * Transform into Categories and Products node based from the collection parameter
   *
   * @param {Object<Array>} collection
   * @param {String} domain
   *
   * @returns {Array}
   */
  _transformCategoryProducts(collection, domain) {
    if (!_.isObject(collection)) {
      return {};
    }

    const subCategories = this._transformCategories(collection.getCategories);
    const products = this._transformProducts(collection.getProducts, domain);

    return {
      subCategories,
      products,
    };
  }

  transformHomeStaticData(results, domain) {
    if (!_.isObject(results)) {
      return {};
    }
    const makesSet = [];
    const partsSet = [];
    const brandsSet = [];
    const popularSearchesSet = [];

    // Makes
    _.forEach(results.makes, (makeItem) => {
      makesSet.push({
        text: makeItem,
        image: Image.url(makeItem, domain),
        link: `/${seoEncode(makeItem)}`,
      });
    });
    // Parts
    _.forEach(results.parts, (partItem) => {
      partsSet.push({
        text: partItem,
        image: Image.url(partItem, domain),
        link: `/${seoEncode(partItem)}`,
      });
    });
    // Brands
    _.forEach(results.brands, (brandItem) => {
      brandsSet.push({
        text: brandItem,
        image: Image.url(brandItem, domain),
        link: `/${seoEncode(brandItem)}`,
      });
    });
    // Popular Searches
    _.forEach(results.popularSearches, (popularSearchItem) => {
      popularSearchesSet.push({
        text: popularSearchItem[0],
        link: popularSearchItem[1],
      });
    });


    return {
      shopByPopularParts: partsSet,
      shopByTopBrands: brandsSet,
      featuredMakes: makesSet,
      categoryOrders: results.categories,
      popularSearches: popularSearchesSet,
    };
  }

  /**
   * Transform record into expected categories object output
   *
   * @param {Object<Array>} collection
   *
   * @return {Array<Object>}
   */
  _transformCategories(collection) {
    const categories = [];

    _.each(collection, (category) => {
      categories.push({
        name: category.name,
        link: category.link,
      });
    });

    return categories;
  }

  /**
   * Transform record into expected products object output
   *
   * @param {Object<Array>} collection
   * @param {String} domain
   *
   * @return {Array<Object>}
   */
  _transformProducts(collection, domain) {
    const products = {};

    // products.refinements = this._transformRefinements(collection.value.getRefinements.value);
    products.items = this._transformItems(
      collection.value.records,
      collection.value.miscAttributes,
      domain,
    );
    products.resultCount = collection.value.MetaInfo['Total Number of Matching Records'];
    products.pagination = this._transformPagination(collection.value.MetaInfo);
    products.sortBy = 'Best Match';

    return products;
  }

  /**
   * Returns the list of breadcrumb for the said page
   *
   * @param {Array<Object>} breadcrumbs
   *
   * @return {Array<Object>}
   */
  _transformBreadcrumbs(breadcrumbs) {
    const res = [];

    _.each(breadcrumbs, (breadcrumb) => {
      res.push({
        name: breadcrumb.text,
        link: breadcrumb.url,
      });
    });

    return res;
  }

  /**
   * Transform object into pageination
   *
   * @param {Object} metaInfo
   *
   * @return {Object}
   */
  _transformPagination(metaInfo) {
    return {
      numberOfPages: metaInfo['Number of Pages'],
      currentPage: metaInfo['Page Number'],
      productsPerPage: metaInfo['Number of Records per Page'],
    };
  }

  /**
   * Rettrieve the product items from the list and formats it
   *
   * @param {Array<Object>} items
   * @param {domain} items
   *
   * @return {Array<Object>}
   */
  _transformItems(items, attributes, domain) {
    const itemList = [];

    _.each(items, (itemValue) => {
      itemList.push({
        id: _.get(itemValue, 'id', ''),
        uid: _.get(itemValue, 'UID', ''),
        pid: _.get(itemValue, 'pid', ''),
        productId: _.get(itemValue, 'productId', ''),
        sku: _.get(itemValue, 'sku', ''),
        mfrNumber: _.get(itemValue, 'mfr_number', ''),
        description: _.get(itemValue, 'description', ''),
        brand: _.get(itemValue, 'brand', ''),
        part: _.get(itemValue, 'part', ''),
        isUniversal: _.get(itemValue, 'universal', '0') !== '0',
        isWorldpac: _.get(itemValue, 'worldpac', '0') !== '0',
        isNew: _.get(itemValue, 'is_new', 0) !== 0,
        publishChannelId: _.get(itemValue, 'publish_channel_id', 0),
        pricing: {
          shipping: _.get(itemValue, 'pricing.shipping', 0).toFixed(2),
          handling: _.get(itemValue, 'pricing.handling', 0).toFixed(2),
          specialPrice: _.get(itemValue, 'pricing.special_price', 0).toFixed(2),
          saveAmount: _.get(itemValue, 'pricing.save_amount', 0).toFixed(2),
          savePercent: _.get(itemValue, 'pricing.save_percent', 0).toFixed(2),
          regularPrice: _.get(itemValue, 'pricing.regular_price', 0).toFixed(2),
          listPrice: _.get(itemValue, 'pricing.list_price', 0).toFixed(2),
          corePrice: _.get(itemValue, 'pricing.core', 0).toFixed(2),
          shippingFactor: _.get(itemValue, 'pricing.shipping_factor', ''),
        },
        warranty: _.get(itemValue, 'product_attributes.Warranty', ''),
        productUri: generateProductUri(itemValue, attributes),
        productImageUrl: Image.url(`${_.get(itemValue, 'sku', '')}_1`, domain),
        skuTitle: _.get(itemValue, 'sku_title', ''),
        productAttributes: this._transformAttributes(_.get(itemValue, 'product_attributes', [])),
        skuStatus: _.get(itemValue, 'sku_status', ''),
        bestSeller: _.get(itemValue, 'bestseller', 0) !== 0,
        isClearance: _.get(itemValue, 'isClearance', 0) !== 0,
        isMadeToOrder: _.get(itemValue, 'isMadeToOrder', 0) !== 0,
        isPlBrand: _.get(itemValue, 'isPlBrand', 0) !== 0,
        topLevelCategory: _.get(itemValue, 'wpn_ptl_name', ''),
        category: _.get(itemValue, 'wpn_cat_name', ''),
        subCategory: _.get(itemValue, 'wpn_scat_name', ''),
        fitNotes: this._transformFitNotes(
          _.get(itemValue, 'fitNotes', [],
            _.get(itemValue, 'notes', '')),
        ),
        isVendor: _.get(itemValue, 'isVendor', 0) !== 0,
        vehicleFitment: _.get(itemValue, 'combos', []),
      });
    });

    return itemList;
  }

  /**
   * Retrieve the attributes details and formats it
   *
   * @param {Array<Object>} attributes
   *
   * @return {Array<Object>}
   */
  _transformAttributes(attributes) {
    const productAttributes = [];

    _.each(attributes, (attribute, key) => {
      productAttributes.push({
        label: key,
        value: attribute,
      });
    });

    return productAttributes;
  }

  /**
   * Retrieve the attributes details and formats it
   *
   * @param {Array<Object>} attributes
   *
   * @return {Array<Object>}
   */
  _transformFitNotes(fitments, note) {
    const fitmentItems = [];

    _.each(fitments, (fitment) => {
      fitmentItems.push({
        year: _.get(fitment, 'year', ''),
        make: _.get(fitment, 'make', ''),
        model: _.get(fitment, 'model', ''),
        submodel: _.get(fitment, 'submodel', ''),
        engine: _.get(fitment, 'engine', ''),
        fnotes: note,
      });
    });

    return fitmentItems;
  }

  /**
   * Retrieve Refinements data and Transform its data into a new output format
   *
   * @param {Array<Object>} refinements
   *
   * @return {Object}
   */
  _transformRefinements(refinements) {
    const resultRefinements = {
      selected: [],
      available: [],
    };

    if (refinements.selectedRefinements !== null) {
      resultRefinements.selected.push({
        name: refinements.selectedRefinements[0].name,
        value: refinements.selectedRefinements[0].value,
        link: refinements.selectedRefinements[0]['Removal Link'],
      });
    }

    _.each(refinements, (refinementType, key) => {
      if (refinementType === null || !('link' in refinementType)) {
        return;
      }

      const value = [];

      _.each(refinementType.link, (refineObj, refinekey) => {
        value.push({
          text: refinekey,
          link: refineObj.Link,
          numRec: refineObj.NumRecs,
        });
      });
      resultRefinements.available.push({
        name: key,
        values: value,
      });
    });

    return resultRefinements;
  }

  /**
   * Transform collection base from the key.
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

    if (key in collection) {
      result.push(collection[key]);
    }

    return result;
  }
}
