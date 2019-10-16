/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Brands Routes', () => {
  it('returns top brands', (done) => {
    const limit = 1;

    app.get('/v1/brands/top')
      .query({ domain: DOMAINS.CARPARTS, limit })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.have.lengthOf(limit);

        done();
      }).catch(done);
  });
});
