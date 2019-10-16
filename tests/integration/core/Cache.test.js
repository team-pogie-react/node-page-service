/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import crypto from 'crypto';
import chai from 'chai';
import { each, cloneDeep } from 'lodash';
import chaiAsPromised from 'chai-as-promised';
import { Cache } from '../../../src/core/Cache';
import CacheClient from '../../../src/core/cache/CacheClient';
import configs from '../../../src/configs/cache';

chai.use(chaiAsPromised);
chai.should();

describe('Cache Test', () => {
  const oldConfig = cloneDeep(configs);

  beforeEach(() => {
    Cache.client = null;
  });

  describe('generateKey()', () => {
    it('generates a key from an object using md5', () => {
      configs.driver = 'null';
      const cache = new Cache();
      const obj = {
        int: 1,
        str: 'string',
        deep: {
          obj: 'here',
        },
      };

      const expected = crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');

      cache.generateKey(obj).should.be.equal(expected);
    });

    it('defaults to empty string when generating key of undefined', () => {
      configs.driver = 'null';
      const cache = new Cache();
      const expected = crypto.createHash('md5').update(JSON.stringify('')).digest('hex');

      cache.generateKey(undefined).should.be.equal(expected);
    });
  });

  describe('create()', () => {
    it('creates an instance a Null cache', () => {
      configs.driver = 'null';
      const cache = new Cache();

      cache.getClient().constructor.name.should.equal('Null');
      cache.getClient().should.be.an.instanceOf(CacheClient);
    });

    it('defaults to null if there is no cache driver set', () => {
      configs.driver = null;
      const cache = new Cache();

      cache.getClient().constructor.name.should.equal('Null');
      cache.getClient().should.be.an.instanceOf(CacheClient);
    });

    it('defaults to null if other drivers are not available', () => {
      configs.driver = 'redis';

      const cache = new Cache();

      // force to emit error.
      const stubError = new Error('connection error');
      stubError.code = 'ECONNREFUSED';
      cache.getClient().client.store.getClient().emit('error', stubError);

      cache.getClient().constructor.name.should.equal('Null');
      cache.getClient().should.be.an.instanceOf(CacheClient);
    });

    it('creates a Redis cache instance', () => {
      configs.driver = 'redis';
      configs.clients.redis.host = oldConfig.clients.redis.host;

      const cache = new Cache();

      cache.getClient().constructor.name.should.equal('Redis');
      cache.getClient().should.be.an.instanceOf(CacheClient);
    });
  });

  describe('cache client methods', () => {
    let cache;
    const cacheMethods = [
      'getClient',
      'get',
      'getMany',
      'put',
      'putMany',
      'forget',
      'forgetByPattern',
      'remember',
      'rememberForever',
      'flush',
      'getPrefix',
      'setPrefix',
    ];

    before(() => {
      cache = new Cache();
    });

    each(cacheMethods, (method) => {
      it(`has "${method}" method in the cache client`, () => {
        cache[method].should.be.a('function');
      });
    });
  });
});
