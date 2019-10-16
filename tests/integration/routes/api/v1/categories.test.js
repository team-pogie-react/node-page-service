/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import '../../../hooks/routeAfterHook';
import _ from 'lodash';
import app from '../../../../fixtures/app';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Categories Routes', () => {
  it('returns top-level categories and its sub categories', (done) => {
    app.get('/v1/categories')
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.data.should.be.an('array').and.has.lengthOf(8);

        done();
      }).catch(done);
  });
});
