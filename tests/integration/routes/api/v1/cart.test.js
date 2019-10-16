/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app, { expect } from '../../../../fixtures/app';
import { itOrSkip } from '../../../../helpers';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Cart Routes', () => {
  const ORDER_ID = process.env.TEST_ORDER_ID;

  itOrSkip('aggregates cart page for order', ORDER_ID, (done) => {
    app.get(`/v1/cart/${ORDER_ID}`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          // 'metas',
          'widgets',
          'orders',
          'years',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);

        _.each(expectedKeys, (key) => {
          expect(response.body.data[key], key).to.not.be.empty;
        });

        done();
      }).catch(done);
  });
});
