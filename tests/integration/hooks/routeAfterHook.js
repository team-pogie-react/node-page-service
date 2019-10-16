/* eslint-env mocha */
import app from '../../fixtures/app';

before(() => {});

after((done) => {
  app.close(done);
});
