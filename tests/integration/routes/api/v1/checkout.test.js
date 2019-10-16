/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { itOrSkip } from '../../../../helpers';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Checkout Routes', () => {
  const ORDER_ID = process.env.TEST_ORDER_ID;

  itOrSkip('aggregates checkout page for order', ORDER_ID, (done) => {
    app.get(`/v1/checkout/${ORDER_ID}`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          // 'metas',
          'widgets',
          'orders',
          'shippingMethods',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.orders.should.include.all.keys(['shipment', 'country', 'states']);

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });

  itOrSkip('aggregates quick address (qas) page for order', ORDER_ID, (done) => {
    app.get(`/v1/checkout/${ORDER_ID}/qas`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          // 'metas',
          'widgets',
          'orders',
          'verify',
          // 'refine',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.have.property('refine');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.orders.should.have.property('shipment')
          .and.not.include.all.keys(['country', 'states']);

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });

  itOrSkip('aggregates review page for order', ORDER_ID, (done) => {
    app.get(`/v1/checkout/${ORDER_ID}/review`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          // 'metas',
          'widgets',
          'orders',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.orders.should.have.property('shipment')
          .and.not.include.all.keys(['country', 'states']);

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });

  itOrSkip('aggregates payment page for order', ORDER_ID, (done) => {
    app.get(`/v1/checkout/${ORDER_ID}/payment`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          // 'metas',
          'widgets',
          'orders',
          'shippingMethods',
          'braintree',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.orders.should.have.property('appliedCoupon');

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });

  itOrSkip('aggregates confirmation page for order', ORDER_ID, (done) => {
    app.get(`/v1/checkout/${ORDER_ID}/confirmation`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          // 'metas',
          'widgets',
          'orders',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.orders.should.have.property('shipment')
          .and.not.include.all.keys(['country', 'states']);

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });
});
