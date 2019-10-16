/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Search Routes', () => {
  it('returns aggregated response for search page', (done) => {
    app.get('/v1/search')
      .query({
        domain: DOMAINS.CARPARTS,
        q: 'mirror',
        vehicle: {
          make: 'Honda',
        },
      })
      .then((response) => {
        const expectedKeys = [
          'meta',
          'breadcrumbs',
          'widgets',
          'products',
          'years',
          'navigationCategories',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.products.should.not.have.property('breadcrumbs');

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });
});
