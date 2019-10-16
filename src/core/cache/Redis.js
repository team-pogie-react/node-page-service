import { map } from 'lodash';
import manager from 'cache-manager';
import redis from 'cache-manager-redis-store';
import Logger from '../Logger';
import CacheClient from './CacheClient';
import { isNewrelicEnabled } from '../helpers';

export class RedisError extends Error {
  constructor(...args) {
    super(...args);

    this.name = this.constructor.name;
  }
}
export default class Redis extends CacheClient {
  /**
   * Create Redis cache client instance.
   *
   * @param {String} prefix
   * @param {Object} options
   */
  constructor(prefix = '', options = {}) {
    super();

    this.prefix = prefix;
    this.client = this._create(options);
  }

  /**
   * Create cache client.
   *
   * @param {Object} options
   *
   * @returns {Object}
   */
  _create(options) {
    const opts = {
      store: redis,
      host: options.host,
      port: options.port,
      db: options.db,
    };

    if (options.password) {
      opts.password = options.password;
    }

    const cache = manager.caching(opts);
    const client = cache.store.getClient();

    client.on('ready', () => {
      this._closed = false;
    });

    client.on('error', (error) => {
      const { code } = error;
      Logger.error(error);
      this._sendErrorMetrics(error);

      if (code === 'ECONNREFUSED' || code === 'NR_CLOSED') {
        client.quit();
        this._closed = true;
      }
    });

    return cache;
  }

  /**
   * Send notice of error to metrics (currently newrelic).
   *
   * @param {Object} error
   *
   * @returns void
   */
  _sendErrorMetrics(error) {
    if (isNewrelicEnabled()) {
      // eslint-disable-next-line global-require
      const newrelic = require('newrelic');
      newrelic.noticeError(new RedisError(error.message), error);
    }
  }

  /**
   * Client getter.
   *
   * @returns {Object}
   */
  getClient() {
    return this.client;
  }

  /**
   * Determine if the flag _closed is true.
   *
   * @returns {Boolean}
   */
  isClosed() {
    return Boolean(this._closed);
  }

  /**
   * Prefix getter.
   *
   * @returns {String}
   */
  getPrefix() {
    return this.prefix;
  }

  /**
   * Prefix getter.
   *
   * @param {String} prefix
   *
   * @returns {Redis}
   */
  setPrefix(prefix) {
    this.prefix = prefix;

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
    return new Promise((resolve, reject) => {
      this.client.get(this.getPrefix() + key)
        .then((result) => {
          resolve(result);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Get cached values by keys.
   *
   * @param  {...String} keys
   *
   * @returns {Promise<Array|Null>}
   */
  getMany(...keys) {
    return new Promise((resolve, reject) => {
      const keysWithPrefix = map(keys, key => this.getPrefix() + key);

      this.client.mget(...keysWithPrefix)
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
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
    return new Promise((resolve, reject) => {
      this.client.set(this.getPrefix() + key, value, { ttl })
        .then((result) => {
          if (result === 'OK') {
            return resolve(true);
          }

          return resolve(false);
        })
        .catch(error => reject(error));
    });
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
    return new Promise((resolve, reject) => {
      const values = this._setPrefixForPutMany(sets);

      this.client.mset(...values, { ttl })
        .then((result) => {
          const ok = result === 'OK' || 'OK' in result;

          resolve(ok);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Set prefix for the keys.
   *
   * @param {Array} sets
   *
   * @returns {Array}
   */
  _setPrefixForPutMany(sets = []) {
    const newSet = [];

    for (let i = 0; i < sets.length; i += 2) {
      const key = this.getPrefix() + sets[i];
      const value = sets[i + 1];

      newSet.push(...[key, value]);
    }

    return newSet;
  }

  /**
   * Delete a cache.
   *
   * @param {...String} keys
   *
   * @returns {Promise<Boolean>}
   */
  forget(...keys) {
    return new Promise((resolve, reject) => {
      this.client.del(...keys)
        .then(rows => resolve(rows > 0))
        .catch(error => reject(error));
    });
  }

  /**
   * Delete cache values by pattern.
   *
   * @param {String} pattern
   *
   * @returns {Promise<Boolean>}
   */
  forgetByPattern(pattern = '*') {
    return new Promise((resolve, reject) => {
      this.client.keys(pattern)
        .then(keys => this.forget(...keys))
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
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
      this.client.wrap(this.getPrefix() + key, callback, { ttl })
        .then(result => resolve(result))
        .catch(error => reject(error));
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
    return this.remember(key, null, callback);
  }

  /**
   * Flush the cache db.
   *
   * @returns {Promise<Boolean>}
   */
  flush() {
    return new Promise((resolve, reject) => {
      this.client.reset()
        .then((result) => {
          if (result === 'OK') {
            return resolve(true);
          }

          return resolve(false);
        })
        .catch(error => reject(error));
    });
  }
}
