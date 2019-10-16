/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { DOMAINS } from '../../../../../src/configs/services/domains';


describe('Product Routes', () => {
  it('searches for products', (done) => {
    app.get('/v1/products')
      .query({ domain: DOMAINS.CARPARTS, q: 'mirror', itemperpage: 1 })
      .then((response) => {
        const expectedKeys = [
          'resultCount',
          'selectedBrand',
          'items',
          'pagination',
          'refinements',
          'selectedPart',
          'selectedVehicle',
          'sortBy',
        ];

        const notEmpty = _.without(expectedKeys, 'selectedVehicle', 'selectedBrand', 'resultCount');

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.have.property('resultCount').that.is.at.least(1);
        response.body.data.should.include.all.keys(expectedKeys);

        _.each(notEmpty, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });
});
