import { get } from 'lodash';
import CacheInstance from '../core/Cache';
import { ApiError } from '../errors';
import ApiService from './ApiService';
import { makeHttpClientError } from '../errors/make';
import { reseller } from '../configs/services/ratings';
import { cache } from '../configs/services';
import TIMEOUTS from '../configs/timeouts';
import ResellerRatingTransformer from '../transformers/ratings/ResellerTransformer';

export default class Rating extends ApiService {
  /**
   * Create rating service.
   */
  constructor() {
    super();

    this.cache = CacheInstance;
    this.ratingTransformer = new ResellerRatingTransformer();
  }

  /**
   * Request a reseller token.
   *
   * @returns {Promise<String>}
   */
  getResellerToken() {
    return new Promise((resolve, reject) => {
      const config = reseller[this.getDomain()];
      const body = {
        grant_type: config.GRANT_TYPE,
        client_id: config.CLIENT_ID,
        client_secret: config.CLIENT_SECRET,
      };

      this.http.post(config.ACCESS_TOKEN_URL, body, { timeout: TIMEOUTS.RESELLER })
        .then((result) => {
          const accessToken = get(result.data, 'access_token', '');

          if (!accessToken) {
            return reject(new ApiError('Invalid token', 403, 403));
          }

          return resolve(accessToken);
        })
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Gets reseller rating review.
   *
   * @param {String} accessToken
   *
   * @returns {Promise<Object>}
   */
  getResellerReviews(accessToken) {
    return new Promise((resolve, reject) => {
      const config = reseller[this.getDomain()];
      const ratingsQuery = {
        perPage: config.PER_PAGE,
        withStars: config.STARS,
      };

      this._requestRatings(config.REVIEW_URL, ratingsQuery, TIMEOUTS.RESELLER, accessToken)
        .then(result => resolve(this.ratingTransformer.review(result)))
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Gets reseller ratings.
   *
   * @param {String} accessToken
   *
   * @returns {Promise<Object>}
   */
  getResellerRatings(accessToken) {
    return new Promise((resolve, reject) => {
      const config = reseller[this.getDomain()];

      this._requestRatings(config.RATING_URL, {}, TIMEOUTS.RESELLER, accessToken)
        .then(result => resolve(this.ratingTransformer.rating(result)))
        .catch(error => reject(makeHttpClientError(error)));
    });
  }

  /**
   * Combine reseller ratings and reviews.
   *
   * @returns {Promise<Object>}
   */
  getResellerInfo() {
    const fn = () => new Promise((resolve, reject) => {
      const tokenPromise = this.getResellerToken();

      Promise
        .all([
          tokenPromise.then(token => this.getResellerRatings(token)),
          tokenPromise.then(token => this.getResellerReviews(token)),
        ])
        .then(([rating, reviews]) => resolve({ rating, reviews }))
        .catch(error => reject(error));
    });

    return this.cache.remember('get_reseller_info', cache.GET_RESELLER_INFO, fn);
  }

  /**
   * Review get request.
   *
   * @param {String} url
   * @param {Object} [query={}]
   * @param {Integer} timeout
   * @param {String} [token='']
   *
   * @returns {Promise<Object>}
   */
  _requestRatings(url, query = {}, timeout, token = '') {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      this.http.get(`${url}`, { params: query, headers, timeout })
        .then((result) => {
          const { data } = result;

          if (!data) {
            return reject(new ApiError('Invalid response', 500, 500));
          }

          return resolve(data);
        })
        .catch(error => reject(makeHttpClientError(error)));
    });
  }
}
