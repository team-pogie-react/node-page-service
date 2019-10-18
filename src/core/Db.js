import crypto from 'crypto';
import sequelize from 'sequelize';
import config from '../configs/database';

export class Db {
  /**
   * Create a cache instance.
   */
  constructor() {
    this._create();
  }

  /**
   * Create an instance of a cache store.
   *
   * @returns {CacheStore}
   */
  _create() {
    let db = {};
    db = new sequelize('ProductLookupDb_merge_optimized', 'hydra', 'gh56vn', {
      host: '10.10.75.236',
      dialect: 'mysql',
    });

    return db; 
  }
}

export default new Db();
