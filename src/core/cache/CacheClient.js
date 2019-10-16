/* eslint-disable no-unused-vars */
export default class CacheClient {
  /**
   * Client getter.
   *
   * @returns {Object}
   */
  getClient() {
    throw new Error('Not implemented.');
  }

  /**
   * Determine if the flag _closed is true.
   *
   * @returns {Boolean}
   */
  isClosed() {
    throw new Error('Not implemented.');
  }

  /**
   * Prefix getter.
   *
   * @returns {String}
   */
  getPrefix() {
    throw new Error('Not implemented.');
  }

  /**
   * Prefix getter.
   *
   * @param {String} prefix
   *
   * @returns {CacheClient}
   */
  setPrefix(prefix) {
    return this;
  }

  /**
   * Get a cached value based from the key provided.
   *
   * @param {String} key
   *
   * @returns {Promise<Object|String>}
   */
  get(key) {
    throw new Error('Not implemented.');
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
    throw new Error('Not implemented.');
  }

  /**
   * Delete a cache.
   *
   * @param {String} key
   *
   * @returns {Promise<Boolean>}
   */
  forget(key) {
    throw new Error('Not implemented.');
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
    throw new Error('Not implemented.');
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
    throw new Error('Not implemented.');
  }

  /**
   * Flush the cache db.
   *
   * @returns {Promise<Boolean>}
   */
  flush() {
    throw new Error('Not implemented.');
  }
}
