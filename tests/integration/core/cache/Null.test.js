/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Null from '../../../../src/core/cache/Null';

chai.use(chaiAsPromised);
chai.should();

describe('Null Test', () => {
  const cache = new Null();

  it('flushes cache', () => cache.flush().should.eventually.be.true);

  it('always return false when calling isClosed()', () => {
    cache.isClosed().should.be.false;
  });

  it(
    'returns false when storing value always',
    () => cache.put('key', 'value').should.eventually.be.false,
  );

  it(
    'returns false when storing multiple values',
    () => cache.putMany(['key', 'value', 'key2', 'value2']).should.eventually.be.false,
  );

  it('returns null when getting a cached value', () => cache.get('key').should.eventually.be.null);
  it(
    'returns null when getting a multiple cached value',
    () => cache.getMany('key', 'key2').should.eventually.be.null,
  );

  it(
    'does nothing when setting prefix',
    () => cache.setPrefix('lel').should.be.deep.equal(cache),
  );

  it('returns an empty string when getting prefix', () => cache.getPrefix().should.be.equal(''));

  describe('remember()', () => {
    it('just execute the callback and resolve the result', () => {
      const payload = { please: 'remember me!' };

      return cache.remember('remember-me', 20, () => payload).should.eventually.become(payload);
    });

    it('executes the callback when remembering forevah!', () => {
      const payload = { please: 'remember forevah!' };

      return cache.rememberForever('forever', () => payload).should.eventually.become(payload);
    });
  });

  it(
    'returns true always when forgetting a cached value',
    () => cache.forget('i-dont-exist').should.eventually.become(true),
  );

  it(
    'returns true always when forgetting a cached value by pattern',
    () => cache.forgetByPattern('idontexist*').should.eventually.become(true),
  );
});
