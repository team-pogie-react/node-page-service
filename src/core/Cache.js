import crypto from 'crypto';
import Redis from './cache/Redis';
import Null from './cache/Null';
import config from '../configs/cache';

export class Cache {
  /**
   * Create a cache instance.
   */
  constructor() {
    this._drivers = {
      null: Null,
      redis: Redis,
    };
    this._createdClients = {};
    this._create();
  }

  /**
   * Create an instance of a cache store.
   *
   * @returns {CacheStore}
   */
  _create() {
    let client = this._getInstance('null');
    const { driver } = config;

    if (driver) {
      client = this._getInstance(driver);
    }

    this.client = client;

    return client;
  }

  /**
   * Attempt to get a cache of a created client,
   * otherwise instantiate a new one.
   *
   * @param {String} driver
   *
   * @returns {CacheClient}
   */
  _getInstance(driver) {
    let instance = this._createdClients[driver];

    if (!instance) {
      const { prefix, clients } = config;
      const Client = this._drivers[driver];

      instance = new Client(prefix, clients[driver]);

      this._createdClients[driver] = instance;
    }

    return instance;
  }

  /**
   * Generate a cache key from a given source.
   *
   * @param {*} source
   *
   * @returns {String}
   */
  generateKey(source = '') {
    return crypto.createHash('md5').update(JSON.stringify(source)).digest('hex');
  }

  /**
   * Client getter.
   *
   * @returns {Object}
   */
  getClient() {
    const { driver } = config;

    if (!this.client) {
      this.client = this._getInstance(driver);
    }

    if (this.client.isClosed()) {
      this.client = null;
      delete this._createdClients[driver];

      return this._getInstance('null');
    }

    return this.client;
  }

  /**
   * Prefix getter.
   *
   * @returns {String}
   */
  getPrefix() {
    return this.getClient().getPrefix();
  }

  /**
   * Prefix getter.
   *
   * @param {String} prefix
   *
   * @returns {Redis}
   */
  setPrefix(prefix) {
    return this.getClient().setPrefix(prefix);
  }

  /**
   * Get a cached value based from the key provided.
   *
   * @param {String} key
   *
   * @returns {Promise<Object|String>}
   */
  get(key) {
    return this.getClient().get(key);
  }

  /**
   * Get cached values by keys.
   *
   * @param  {...String} keys
   *
   * @returns {Promise<Array|Null>}
   */
  getMany(...keys) {
    return this.getClient().getMany(...keys);
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
    return this.getClient().put(key, value, ttl);
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
    return this.getClient().putMany(sets, ttl);
  }

  /**
   * Delete a cache.
   *
   * @param {String} key
   *
   * @returns {Promise<Boolean>}
   */
  forget(key) {
    return this.getClient().forget(key);
  }

  /**
   * Delete cache values by pattern.
   *
   * @param {String} pattern
   *
   * @returns {Promise<Boolean>}
   */
  forgetByPattern(pattern = '*') {
    return this.getClient().forgetByPattern(pattern);
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
    return new Promise((resolve, reject) => {
      this.getClient()
        .remember(key, ttl, callback)
        .then(result => resolve(result))
        .catch((error) => {
          if (!this.client || this.client.isClosed()) {
            return resolve(callback());
          }

          return reject(error);
        });
    });
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
    return this.getClient().rememberForever(key, callback);
  }

  /**
   * Flush the cache db.
   *
   * @returns {Promise<Boolean>}
   */
  flush() {
    return this.getClient().flush();
  }
}

export default new Cache();
