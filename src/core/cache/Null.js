/* eslint-disable no-unused-vars */
import CacheClient from './CacheClient';

export default class Null extends CacheClient {
  /**
   * Client getter.
   *
   * @returns {Null}
   */
  getClient() {}

  /**
   * Determine if the flag _closed is true.
   *
   * @returns {Boolean}
   */
  isClosed() {
    return false;
  }

  /**
   * Prefix getter.
   *
   * @returns {String}
   */
  getPrefix() {
    return '';
  }

  /**
   * Get a cached value based from the key provided.
   *
   * @param {String} key
   *
   * @returns {Promise<Object|String>}
   */
  get(key) {
    return Promise.resolve(null);
  }

  /**
   * Get cached values by keys.
   *
   * @param  {...String} keys
   *
   * @returns {Promise<Array|Null>}
   */
  getMany(...keys) {
    return Promise.resolve(null);
  }

  /**
   * Put a value in the cache.
   *
   * @param {String} key
   * @param {String} value
   * @param {Integer} ttl
   *
   * @returns {Promise<Boolean>}
   */
  put(key, value, ttl = null) {
    return Promise.resolve(false);
  }

  /**
   * Multiple cache put.
   *
   * @param {Array} sets
   * @param {Integer} ttl
   *
   * @returns {Promise<Boolean>}
   */
  putMany(sets, ttl = null) {
    return Promise.resolve(false);
  }

  /**
   * Delete a cache.
   *
   * @param {String} key
   *
   * @returns {Promise<Boolean>}
   */
  forget(key) {
    return Promise.resolve(true);
  }

  /**
   * Delete cache values by pattern.
   *
   * @param {String} pattern
   *
   * @returns {Promise<Boolean>}
   */
  forgetByPattern(pattern = '*') {
    return Promise.resolve(true);
  }

  /**
   * Attempt to get an existing record from cache.
   * If it does not exist, the callback will be executed
   * and the result will be stored in the cache.
   *
   * @param {String} key
   * @param {Integer} ttl
   * @param {Function} callback
   *
   * @returns {Promise<Object>}
   */
  remember(key, ttl, callback) {
    return Promise.resolve(callback());
  }

  /**
   * Like @remember() except it remembers forever <3
   *
   * @param {String} key
   * @param {Function} callback
   *
   * @returns {Promise<Object>}
   */
  rememberForever(key, callback) {
    return this.remember(key, null, callback);
  }

  /**
   * Flush the cache db.
   *
   * @returns {Promise<Boolean>}
   */
  flush() {
    return Promise.resolve(true);
  }
}
