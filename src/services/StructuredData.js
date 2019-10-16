import queryString from 'qs';
import { merge, _ } from 'lodash';
import ApiService from './ApiService';
import TIMEOUTS from '../configs/timeouts';
import CacheInstance from '../core/Cache';
import CacheConfig from '../configs/services/cache';
import operationKeys from '../configs/services/operation-keys';
import { makeHttpClientError } from '../errors/make';

export default class StructuredData extends ApiService {
  /** @inheritdoc */
  constructor() {
    super();

    this.siteProtocol = 'https://';
    this.data = [];
    this.cache = CacheInstance;
  }

  /**
   * Generate the structured data based from the params submitted
   *
   * @param {Object} params
   *
   * @return {Array{Object}}
   */
  generate(params) {
    this.data = [];
    if ('BreadcrumbList' in params
      && (!_.isEmpty(params.BreadcrumbList) && !('error' in params.BreadcrumbList))) {
      this.data.push(this._getBreadcrumbList(params.BreadcrumbList));
    }

    if ('WebPage' in params
      && (!_.isEmpty(params.WebPage) && !('error' in params.WebPage))) {
      this.data.push(this._getWebPage(params.WebPage));
    }

    if ('Organization' in params
      && (!_.isEmpty(params.Organization) && !('error' in params.Organization))) {
      this.data.push(this._getOrganization(params.Organization));
    }

    if ('Product' in params
      && (!_.isEmpty(params.Product) && !('error' in params.Product))) {
      const isSkuDetail = _.get(params, '_complete', false);
      const ratings = _.get(params, '_ratings', []);
      const title = _.get(params, '_meta.title', {});
      this.data.push(this._getProduct(params.Product, ratings, title, isSkuDetail));
    }

    return this.data;
  }

  /**
   * Get the Ratings of the products based from the Product ID's
   *
   * @param {Array} ids - Compose of Product Id's
   *
   * @return {Array{Object}}
   */
  getRatings(ids) {
    let idList = [];

    if (_.isEmpty(ids)) {
      return [];
    }

    idList = ids;
    const fn = () => Promise.all(this._aggregateRatingCalls(ids))
      .then(res => Promise.resolve(res));

    return this.cache.remember(
      `ratings_${this.cache.generateKey(idList.sort())}`,
      CacheConfig.GET_TURNTO_EXPIRY,
      fn,
    );
  }

  /**
   * Aggregate Rating Service calls.
   *
   * @param {Array} ids
   *
   * @return {Array}
   */
  _aggregateRatingCalls(ids) {
    const promises = [];
    const url = process.env.TURN_TO_URL;
    // Retrieve ID per batch of 20
    do {
      const promise = this._getRequestPromise(ids, url);
      promises.push(promise);
    } while (ids.length > 0);

    return promises;
  }

  /**
   * Instantiate a Promise for the turnto api request
   *
   * @param {Array} ids
   * @param {String} url
   *
   * @return {Promise{Object}}
   */
  _getRequestPromise(ids, url) {
    return new Promise((resolve, reject) => {
      const newIds = ids.splice(0, 20); // Get the first 20 item in the array
      const query = queryString.stringify({
        sku: newIds.join(','),
        locale: 'en_US',
      }, { encode: false });

      const opts = {
        headers: {
          Authorization: `Bearer ${process.env.TURN_TO_KEY}`,
        },
        timeout: TIMEOUTS.TURNTO,
      };

      this.http.get(`${url}?${query}`, opts)
        .then(response => resolve(response.data))
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Get the webpage Structured Data
   *
   * @param {Object} params
   *
   * @return {Object}
   */
  _getWebPage(params) {
    return {
      WebPage: {
        '@type': 'WebPage',
        name: _.get(params, 'header'),
      },
    };
  }

  /**
   * Get the Breadcrumb Structured Data
   *
   * @param {Array} params - Compose of Product Id's
   *
   * @return {Object}
   */
  _getBreadcrumbList(params) {
    if (params === undefined) {
      return {
        '@context': 'https://schema.org/',
        '@type': 'BreadcrumbList',
      };
    }

    const itemList = [];
    let count = 1;

    _.forEach(params, (item) => {
      itemList.push({
        position: count,
        '@type': 'ListItem',
        name: item.text,
        item: this.siteProtocol
          + this.getDomain(operationKeys.GET_TURNTO_RATING)
          + (item.value ? item.value : ''),
      });

      count += 1;
    });

    return {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: itemList,
    };
  }

  /**
   * Retrieve the Organization Structured data from the Meta Parameter in Strapi Widget
   *
   * @param {Array} params
   *
   * @return {Object}
   */
  _getOrganization(params) {
    let details = {};

    _.forEach(params, (item) => {
      if (item.name === 'Category') {
        details = merge(details, item.apiDetails.props.jsonld);

        return false;
      }

      return true;
    });

    return details;
  }

  /**
   * Get the Product Node Structured Data
   *
   * @param {Array} params
   * @param {Array} ratings
   * @param {Bool} isSku - Identify if the product contains a single SKU (PDP)
   *
   * @return {Array{Object}}
   */
  _getProduct(param, ratings, title, isSku = false) {
    if (param === undefined) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
      };
    }

    const result = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: (isSku ? _.get(param, 'skuTitle', title) : title),
      offers: (isSku ? this._getSkuOffer(param) : this._getOffers(param)),
    };

    const aggregateRate = this._getAggregateRating(ratings, isSku);

    if (!_.isEmpty(aggregateRate)) {
      result.aggregateRating = aggregateRate;
    }

    if (isSku) {
      result.image = _.get(param, 'productImageUrl');
      result.brand = _.get(param, 'brand');
      result.sku = _.get(param, 'sku');
    }

    return result;
  }

  /**
   * Get the AggregateRating Node Structured Data
   *
   * @param {Array} ratings
   * @param {Bool} isSku - Identify if the product contains a single SKU (PDP)
   *
   * @return {Array{Object}}
   */
  _getAggregateRating(ratings, isSku = false) {
    let bestRating = 0;
    let worstRating = 5;
    let ratingCount = 0;
    let ratingValue = 0;
    let count = 0;
    const result = {};

    _.forEach(ratings, (rating) => {
      _.forEach(rating, (product) => {
        if (product.reviews === 0) {
          return true;
        }

        if (product.averageRating > bestRating) {
          bestRating = product.averageRating;
        }

        if (product.averageRating <= worstRating) {
          worstRating = product.averageRating;
        }

        count += 1;
        ratingValue += product.averageRating;
        ratingCount += product.reviews;

        return true;
      });
    });

    if (ratingCount === 0) {
      return {};
    }

    result.ratingValue = (count === 0) ? 0 : Math.round((ratingValue / count) * 100) / 100;
    result.bestRating = bestRating;
    result.ratingCount = ratingCount;

    if (isSku) {
      result['@type'] = 'AggregateRating';
      result.worstRating = worstRating;
    }

    return result;
  }

  /**
   * Get the Offer Node Structured Data
   *
   * @param {Array} param
   *
   * @return {Array{Object}}
   */
  _getOffers(param) {
    let set = false;
    let lowestPrice = null;
    let highestPrice = 0;
    const result = {
      priceCurrency: 'USD',
      availability: 'http://schema.org/InStock',
    };

    _.forEach(param, (product) => {
      const price = parseFloat(product.pricing.regularPrice);

      if (!set) {
        lowestPrice = price;
        highestPrice = price;

        set = true;

        return true;
      }

      if (price < lowestPrice) {
        lowestPrice = price;
      }

      if (price >= highestPrice) {
        highestPrice = price;
      }

      return true;
    });

    result['@type'] = 'AggregateOffer';
    result.lowPrice = lowestPrice;
    result.highPrice = highestPrice;

    return result;
  }

  /**
   * Get the Offer Node for SKU Detail Structured Data
   *
   * @param {Array} param
   *
   * @return {Array{Object}}
   */
  _getSkuOffer(param) {
    const result = {
      priceCurrency: 'USD',
      availability: 'http://schema.org/InStock',
    };

    result['@type'] = 'Offer';
    result.url = this.siteProtocol + this.getDomain(operationKeys.GET_TURNTO_RATING)
      + param.productUri;
    result.price = _.get(param, 'pricing.regularPrice');

    return result;
  }
}
