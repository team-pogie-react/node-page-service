/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Redis from '../../../../src/core/cache/Redis';

chai.use(chaiAsPromised);
chai.should();

describe('Redis Test', () => {
  const cache = new Redis();

  beforeEach((done) => {
    cache.setPrefix('')
      .flush()
      .then(() => done())
      .catch(() => done());
  });

  it('flushes cache', () => cache.flush().should.eventually.be.true);

  it('determines connection if closed', () => {
    const withError = new Redis();

    withError.isClosed().should.be.false;
    // force to emit error.
    const stubError = new Error('connection error');
    stubError.code = 'ECONNREFUSED';
    withError.getClient().store.getClient().emit('error', stubError);
    withError.isClosed().should.be.true;
  });

  describe('prefix', () => {
    it('sets prefix', (done) => {
      cache.setPrefix('pre_')
        .put('something', 'with-prefix', 10).should.eventually.be.true
        .then(() => cache.get('something').should.eventually.become('with-prefix'))
        .then(() => cache.getClient().keys('pre*').should.eventually.become(['pre_something']))
        .should.notify(done);
    });
  });

  describe('put() and get()', () => {
    it('stores a new key value pair', (done) => {
      cache.put('key', 'value').should.eventually.be.true
        .then(() => cache.get('key').should.eventually.be.equal('value'))
        .should.notify(done);
    });

    it('stores a value that expires in seconds', (done) => {
      cache.put('new-key', 'new-value', 10).should.eventually.be.true
        .then(() => cache.getClient().ttl('new-key').should.eventually.equal(10))
        .should.notify(done);
    });

    it('stores a json value', (done) => {
      cache.put('json', { a: 'json', object: 'yay!' }).should.eventually.be.true
        .then(() => cache.get('json').should.eventually.be.an('object').that.has.property('a', 'json'))
        .should.notify(done);
    });

    it('puts many values', (done) => {
      cache.setPrefix('many_').putMany(['key1', 'value1', 'jsonkey', { json: 'value' }], 10)
        .then(() => cache.getClient().ttl(`${cache.getPrefix()}key1`).should.eventually.equal(10))
        .then(() => cache.getClient().ttl(`${cache.getPrefix()}jsonkey`).should.eventually.equal(10))
        .then(() => cache.getClient().keys('many*').should.eventually.have.lengthOf(2))
        .then(() => cache.getMany('key1', 'jsonkey'))
        .then((result) => {
          result.should.have.lengthOf(2);
          result[0].should.be.equal('value1');
          result[1].should.be.an('object').that.is.deep.equal({ json: 'value' });

          done();
        })
        .catch(done);
    });

    it('puts many value without ttl', (done) => {
      cache.putMany(['key1', 'value1', 'jsonkey', { json: 'value' }])
        .then(() => cache.getClient().ttl('key1').should.eventually.equal(-1))
        .then(() => cache.getClient().ttl('jsonkey').should.eventually.equal(-1))
        .then(() => cache.getMany('key1', 'jsonkey'))
        .then((result) => {
          result.should.have.lengthOf(2);
          result[0].should.be.equal('value1');
          result[1].should.be.an('object').that.is.deep.equal({ json: 'value' });

          done();
        })
        .catch(done);
    });
  });

  describe('remember()', () => {
    it('gets an item from the cache or store a default value if it does not exist', (done) => {
      const payload = { please: 'remember me!' };
      cache.get('remember-me').should.eventually.be.null
        .then(() => cache.remember('remember-me', 20, () => payload).should.eventually.become(payload))
        .then(() => cache.get('remember-me').should.eventually.become(payload))
        .then(() => cache.getClient().ttl('remember-me').should.eventually.become(20))
        .should.notify(done);
    });

    it('does not remember a cache twice', (done) => {
      const rememberMeTwice = 'remember-me-twice';
      const payload = { please: 'remember me twice!' };
      const promised = () => new Promise((resolve) => { resolve(payload); });

      cache.get(rememberMeTwice).should.eventually.be.null
        .then(() => cache.remember(rememberMeTwice, 50, promised).should.eventually.become(payload))
        .then(() => cache.get(rememberMeTwice).should.eventually.become(payload))
        .then(() => cache.getClient().ttl(rememberMeTwice).should.eventually.become(50))
        .then(() => cache.remember(rememberMeTwice, 50, promised))
        .then(() => cache.getClient().keys(rememberMeTwice).should.eventually.have.lengthOf(1))
        .should.notify(done);
    });

    it('remembers forevah!', (done) => {
      const payload = { please: 'remember forevah!' };
      cache.get('forever').should.eventually.be.null
        .then(() => cache.rememberForever('forever', () => payload).should.eventually.become(payload))
        .then(() => cache.get('forever').should.eventually.become(payload))
        .then(() => cache.getClient().ttl('forever').should.eventually.become(-1))
        .should.notify(done);
    });
  });

  describe('forget()', () => {
    const forgetKey = 'forget-me';

    beforeEach((done) => {
      cache.put(forgetKey, 'noooooooOOOO!').then(() => done()).catch(() => done());
    });

    it('forgets a cached value', (done) => {
      cache.get(forgetKey).should.eventually.not.be.null
        .then(() => cache.forget(forgetKey).should.eventually.become(true))
        .then(() => cache.get(forgetKey).should.eventually.be.null)
        .should.notify(done);
    });

    it('accepts multiple keys', (done) => {
      const forgetYes = 'forget-me-yes';

      cache.put(forgetYes, 'yeeeeeeeeeeeeees!')
        .then(() => cache.forget(forgetKey, forgetYes).should.eventually.become(true))
        .then(() => cache.get(forgetKey).should.eventually.be.null)
        .then(() => cache.get(forgetYes).should.eventually.be.null)
        .should.notify(done);
    });

    it(
      'returns false if the cache trying to forget does not exist',
      () => cache.forget('i-dont-exist').should.eventually.become(false),
    );
  });

  describe('forgetByPattern()', () => {
    beforeEach((done) => {
      cache.setPrefix('set1').putMany(['key1', 'value1', 'key2', 'value2'])
        .then(() => cache.setPrefix('set2').put('key_2_1', 'value_2_1'))
        .then(() => done())
        .catch(() => done());
    });

    it('forgets values by pattern, ignoring the prefix', (done) => {
      cache.forgetByPattern('set1*').should.eventually.become(true)
        .then(() => cache.setPrefix('set1').getMany('key1', 'key2'))
        .then(() => cache.setPrefix('set2').get('key_2_1').should.eventually.become('value_2_1'))
        .should.notify(done);
    });
  });
});
