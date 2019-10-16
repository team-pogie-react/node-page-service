/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { itOrSkip } from '../../../../helpers';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Order Routes', () => {
  const ORDER_ID = process.env.TEST_ORDER_ID;

  itOrSkip('gets an order id', ORDER_ID, (done) => {
    app.get(`/v1/orders/${ORDER_ID}`)
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          'orderStatus',
          'orderDate',
          'lastModified',
          'items',
          'summary',
          'customer',
          'shipment',
          'country',
          'states',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.should.have.property('orderId', String(ORDER_ID));

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });

  itOrSkip('gets shipping methods of order', ORDER_ID, (done) => {
    app.get(`/v1/orders/${ORDER_ID}/shipping-methods`)
      .query({
        domain: DOMAINS.CARPARTS,
        priceLevel: 'price4',
        shippingLevel: 'shipping',
        handlingLevel: 'handling',
        useDynamicShipping: 1,
        freeShipping: 0,
        restrictedZipCode: 1,
        dscVersion: 1,
      })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.to.have.property('shipmentMethods').that.is.not.empty;
        response.body.data.should.to.have.property('hasRestrictedZipCode');

        done();
      }).catch(done);
  });

  it('gets a brain tree token', (done) => {
    app.get('/v1/orders/token')
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.to.have.property('tokenizationKey').that.is.not.empty;

        done();
      }).catch(done);
  });
});
