/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import '../hooks/routeAfterHook';
import app from '../../fixtures/app';
import { Cache } from '../../../src/core/Cache';

describe('Cache Routes', () => {
  const cache = new Cache();

  beforeEach((done) => {
    cache.flush()
      .then(() => cache.putMany(['key1', 'value1', 'key2', 'value2']))
      .then(() => done())
      .catch(() => done());
  });

  it('does not display all cache :P', (done) => {
    app.get('/cache').then((response) => {
      response.should.have.status(200);
      response.body.should.be.an('object');
      response.body.data.should.have.property('message').that.contains('Nope');
      response.body.data.should.have.property('code', 200);

      done();
    }).catch(done);
  });

  it('deletes all cache', (done) => {
    app.delete('/cache')
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.data.should.have.property('message').that.contains('deleted');
        response.body.data.should.have.property('code', 200);

        return cache.getMany('key1', 'key2');
      })
      .then((result) => {
        result.should.have.lengthOf(2);
        result.should.have.members([null, null]);

        done();
      })
      .catch(done);
  });

  it('deletes cache by pattern', (done) => {
    cache.put('notme', 'please')
      .then(() => app.delete('/cache')
        .query({ pattern: 'key*' })
        .then((response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.data.should.have.property('message').that.contains('deleted');
          response.body.data.should.have.property('code', 200);

          return cache.getMany('key1', 'key2', 'notme');
        }))
      .then((result) => {
        result.should.have.lengthOf(3);
        result.should.have.members([null, null, 'please']);

        done();
      })
      .catch(done);
  });

  it('deletes a single cache by key', (done) => {
    app.delete('/cache/key2')
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.data.should.have.property('message').that.contains('deleted');
        response.body.data.should.have.property('code', 200);

        return cache.getMany('key1', 'key2');
      })
      .then((result) => {
        result.should.have.lengthOf(2);
        result.should.have.members(['value1', null]);

        done();
      })
      .catch(done);
  });

  it('gets a single cache by key', (done) => {
    app.get('/cache/key2')
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.data.should.have.property('key', 'key2');
        response.body.data.should.have.property('value', 'value2');
        response.body.data.should.have.property('code', 200);

        done();
      })
      .catch(done);
  });
});
