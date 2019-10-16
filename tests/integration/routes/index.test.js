/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import '../hooks/routeAfterHook';
import app from '../../fixtures/app';

describe('Base Routes', () => {
  it('pings the base url', (done) => {
    app.get('/ping').then((response) => {
      response.should.have.status(200);
      response.body.should.be.an('object');
      response.body.data.should.have.property('success', true);
      response.body.data.should.have.property('code', 200);

      done();
    }).catch(done);
  });

  it('adds the response time when debug is on', (done) => {
    app.get('/ping')
      .query({ debug: true })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.have.property('debug');
        response.body.debug.should.have.property('elapsed');
        response.body.debug.should.have.property('version').that.is.not.empty;

        done();
      })
      .catch(done);
  });

  it('checks health', (done) => {
    app.get('/health')
      .then((response) => {
        response.should.have.status(200);
        response.body.should.have.property('details');
        response.body.should.have.property('status').that.is.not.empty;
        response.body.details.should.include.all.keys(['cpu', 'memory', 'load', 'timestamp']);

        done();
      })
      .catch(done);
  });
});
