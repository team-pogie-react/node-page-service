import _ from 'lodash';
import Image from '../core/Image';
import { isFalsy } from '../core/helpers';

export default class ProductsTransformer {
  /**
   * Transform product result.
   *
   * @param {Object} items
   * @param {String} domain
   * @param {Object} prices
   *
   * @returns {Object}
   */
  transformProductResults(items, sort, domain, prices = {}) {
    if (!_.isObject(items)) {
      return {};
    }

    if (!isFalsy(items.redirect)) {
      return items;
    }

    return {
      items: this._transformProducts(items.products, sort, domain, prices),
      refinements: this._transformRefinements(items),
      resultCount: items.total_products,
      pagination: this._transformPagination(items),
      sortBy: items.sort_by,
      selectedPart: this._transformSelectedPart(items),
      selectedBrand: this._transformSelectedBrand(items),
      selectedKeyword: this._transformSelectedKeyword(items),
      selectedVehicle: this._transformSelectedVehicle(items),
      vehicleKeyword: items.vehicle_keyword,
      searchKeyword: this._transformSearchKeyword(items),
      allDirectFit: this._transformAllDirectFit(items),
      allUniversal: this._transformAllUniversal(items),
      isVehicleFit: this._transformIsVehicleFit(items),
      fallback: this._transformSpellCheck(items),
      productIds: items.product_ids,
    };
  }

  /**
   * Transform product items.
   *
   * @param {Array} products
   * @param {String} orderBy
   * @param {String} domain
   * @param {Object} prices
   *
   * @returns {Array}
   */
  _transformProducts(products, orderBy, domain, prices) {
    const result = [];

    _.each(products, (value) => {
      const arrproductAttributes = [];
      const arrpricing = this._transformPricing(value.pricing, prices[value.id]);

      if (!_.isEmpty(value.product_attributes)) {
        _.each(value.product_attributes, (attrValue, attrKey) => {
          arrproductAttributes.push({
            label: attrKey,
            value: attrValue,
          });
        });
      }

      result.push({
        id: value.id,
        uid: value.uid,
        pid: value.pid,
        productId: value.product_id,
        sku: value.sku,
        mfrNumber: value.mfr_number,
        description: value.description,
        brand: value.brand_name,
        part: value.part_name,
        isUniversal: value.isuniversal,
        isActive: value.isactive,
        isWorldpac: value.isworldpac,
        isNew: value.isnew,
        publishChannelId: value.publish_channel_id,
        pricing: arrpricing,
        warranty: value.warranty,
        productUri: value.product_uri,
        productImageUrl: Image.url(`${value.sku}_is`, domain),
        skuTitle: value.sku_title,
        productAttributes: arrproductAttributes,
        skuStatus: value.sku_status,
        bestSeller: value.bestseller,
        isClearance: value.isclearance,
        isMadeToOrder: value.ismadetoorder,
        isPlBrand: value.isplbrand,
        topLevelCategory: value.tlcat_name,
        category: value.cat_name,
        subCategory: value.scat_name,
        fitNotes: this._transformFitnotes(value.fit_notes),
        isVendor: value.isvendor,
      });
    });

    const sortedResult = this.sortProducts(result, orderBy);

    return sortedResult;
  }

  /**
   * Return a sort products based from pricing.regularPrice
   *
   * @param {Array{Object}} products
   * @param {String} orderBy
   *
   * @returns {Array{Object}}
   */
  sortProducts(products, orderBy) {
    const result = products;

    result.sort((a, b) => {
      const priceA = parseFloat(a.pricing.regularPrice);
      const priceB = parseFloat(b.pricing.regularPrice);

      if (orderBy === 'DESC') {
        return priceB - priceA;
      } if (orderBy === 'ASC') {
        return priceA - priceB;
      }

      return 0;
    });

    return result;
  }

  /**
   * Transform product details
   *
   * @param {Object} details
   * @param {String} object
   * @param {Boolean} isPla
   * @param {Object} prices
   *
   * @returns {Object}
   */
  transformProductDetails(details, domain, isPla, prices = {}) {
    const product = _.get(details, 'products', null);

    if (product === null) {
      return {};
    }

    let productDetails = null;
    const arrproductAttributes = [];
    const arrpricing = this._transformPricing(product.pricing, prices[product.id]);

    if (!_.isEmpty(product.product_attributes)) {
      _.each(product.product_attributes, (attrproduct, attrKey) => {
        arrproductAttributes.push({
          label: attrKey,
          value: attrproduct,
        });
      });
    }

    productDetails = {
      id: product.id,
      uid: product.uid,
      pid: product.pid,
      productId: product.product_id,
      sku: product.sku,
      mfrNumber: product.mfr_number,
      description: product.description,
      brand: product.brand_name,
      part: product.part_name,
      isUniversal: product.isuniversal,
      isActive: product.isactive,
      isWorldpac: product.isworldpac,
      isNew: product.isnew,
      publishChannelId: product.publish_channel_id,
      pricing: arrpricing,
      warranty: product.warranty,
      productUri: product.product_uri,
      productImageUrl: Image.url(`${product.sku}_is`, domain),
      skuTitle: product.sku_title,
      productAttributes: arrproductAttributes,
      skuStatus: product.sku_status,
      bestSeller: product.bestseller,
      isClearance: product.isclearance,
      isMadeToOrder: product.ismadetoorder,
      isPlBrand: product.isplbrand,
      topLevelCategory: product.tlcat_name,
      category: product.cat_name,
      subCategory: product.scat_name,
      fitNotes: this._transformFitnotes(product.fit_notes),
      isVendor: product.isvendor,
      isVehicleFit: _.get(details, 'isVehicleFit', undefined),
      selectedVehicle: _.get(details, 'selected_vehicle', undefined),
      vendor: product.vendor,
      isPla,
    };

    return productDetails;
  }

  /**
   * Transform pricing node with updated prices.
   *
   * @param {Object} pricing
   * @param {Object} newPrice
   *
   * @returns {Object}
   */
  _transformPricing(pricing, newPrice = {}) {
    if (_.isEmpty(pricing)) {
      return {};
    }

    let regularPrice = newPrice.regular_price;
    let saveAmount = newPrice.save_amount;
    let savePercent = newPrice.save_percent;

    if (isFalsy(parseFloat(regularPrice))) {
      regularPrice = pricing.regular_price;
      saveAmount = pricing.save_amount;
      savePercent = pricing.save_percent;
    }

    return {
      shipping: pricing.shipping.toFixed(2),
      handling: pricing.handling.toFixed(2),
      specialPrice: pricing.special_price.toFixed(2),
      saveAmount: parseFloat(saveAmount).toFixed(2),
      savePercent: parseFloat(savePercent).toFixed(2),
      regularPrice: parseFloat(regularPrice).toFixed(2),
      listPrice: pricing.list_price.toFixed(2),
      corePrice: pricing.core_price.toFixed(2),
      shippingFactor: pricing.shipping_factor.toFixed(2),
    };
  }

  /**
   * Transform refinements
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformRefinements(items) {
    const result = {};
    if (typeof items.refinements !== 'undefined' && items.refinements !== '') {
      const availableRefinements = [];
      _.each(items.refinements, (refValue, refKey) => {
        availableRefinements.push({
          name: refKey,
          values: this._transformRefinementValues(refValue),
        });
      });
      result.available = availableRefinements;
    }

    if (typeof items.selected_refinements !== 'undefined' && items.selected_refinements !== '') {
      const selectedRefinemets = [];
      _.each(items.selected_refinements, (values) => {
        selectedRefinemets.push({
          name: values.name,
          value: values.value,
          link: values.link,
          treat: !_.isEmpty(values.treat) ? values.treat : 'append',
        });
      });

      result.selected = selectedRefinemets;
    }

    return result;
  }

  /**
   * Transform refinement values
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformRefinementValues(refValues) {
    const result = [];
    if (typeof refValues !== 'undefined' && refValues !== '') {
      _.each(refValues, (value, key) => {
        result.push({
          text: key,
          link: value.link,
          numRec: value.num_rec,
        });
      });
    }

    return result;
  }

  /**
   * Transform Pagination
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformPagination(items) {
    const result = {};

    if (typeof items.pagination.number_of_pages !== 'undefined') {
      result.numberOfPages = items.pagination.number_of_pages;
    }

    if (typeof items.pagination.current_page !== 'undefined') {
      result.currentPage = items.pagination.current_page;
    }

    if (typeof items.pagination.products_per_page !== 'undefined') {
      result.productsPerPage = items.pagination.products_per_page;
    }

    return result;
  }

  /**
   * Transform Selected Part
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformSelectedPart(items) {
    if (typeof items.selected_part !== 'undefined' && items.selected_part !== '') {
      return items.selected_part;
    }

    return '';
  }

  /**
   * Transform Selected Brand
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformSelectedBrand(items) {
    if (typeof items.selected_brand !== 'undefined' && items.selected_brand !== '') {
      return items.selected_brand;
    }

    return '';
  }

  /**
   * Transform Selected Vehicle
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformSelectedVehicle(items) {
    if (typeof items.selected_vehicle !== 'undefined' && items.selected_vehicle !== '') {
      return items.selected_vehicle;
    }

    return {};
  }

  /**
   * Transform Selected Keyword
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformSelectedKeyword(items) {
    if (typeof items.selected_keyword !== 'undefined' && items.selected_keyword !== '') {
      return items.selected_keyword;
    }

    return '';
  }

  /**
   * Transform Serch Keyword
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformSearchKeyword(items) {
    if (typeof items.search_keyword !== 'undefined' && items.search_keyword !== '') {
      return items.search_keyword;
    }

    return '';
  }

  /**
   * Transform Direct Fit Product Flag
   *
   * @param Object $items
   * @access public
   * @return Boolen
   */
  _transformAllDirectFit(items) {
    if (typeof items.all_directfit !== 'undefined' && items.all_directfit !== '') {
      return items.all_directfit;
    }

    return '';
  }

  /**
   * Transform Universal Product Flag
   *
   * @param Object $items
   * @access public
   * @return Boolen
   */
  _transformAllUniversal(items) {
    if (typeof items.all_universal !== 'undefined' && items.all_universal !== '') {
      return items.all_universal;
    }

    return '';
  }

  /**
   * Transform Fit Vehicle Flag
   *
   * @param Object $items
   * @access public
   * @return Boolen
   */
  _transformIsVehicleFit(items) {
    if (typeof items.isVehicleFit !== 'undefined' && items.isVehicleFit !== '') {
      return items.isVehicleFit;
    }

    return '';
  }

  /**
   * Transform Fitnote
   *
   * @param Object $fitnotes
   * @access public
   * @return Boolen
   */
  _transformFitnotes(fitnotes) {
    const arrFitnotes = [];
    _.each(fitnotes, (values) => {
      if (!_.isEmpty(values)) {
        const objFitnotes = {};
        _.each(values, (val, key) => {
          if (typeof val !== 'undefined' && val !== '-') {
            objFitnotes[key] = val;
          }
        });

        if (!_.isEmpty(objFitnotes)) {
          arrFitnotes.push(objFitnotes);
        }
      }
    });

    return arrFitnotes;
  }

  /**
   * Transform Spell Check
   *
   * @param Object $items
   * @access public
   * @return Object
   */
  _transformSpellCheck(items) {
    const result = {};

    if (typeof items.fallback !== 'undefined') {
      if (typeof items.fallback.q !== 'undefined' && items.fallback.q !== '') {
        result.q = items.fallback.q;
      }

      if (typeof items.fallback.original !== 'undefined' && items.fallback.original !== '') {
        result.original = items.fallback.original;
      }

      if (typeof items.fallback.url !== 'undefined' && items.fallback.url !== '') {
        result.url = items.fallback.url;
      }
    }

    return result;
  }
}
