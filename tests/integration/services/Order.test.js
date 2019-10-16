/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import { itOrSkip } from '../../helpers';
import OrderService from '../../../src/services/Order';
import { DOMAINS } from '../../../src/configs/services/domains';
import operationKeys from '../../../src/configs/services/operation-keys';

describe('Order Service Test', () => {
  const orders = new OrderService();
  const ORDER_ID = process.env.TEST_ORDER_ID;

  before(() => {
    orders.setDomain(DOMAINS.CARPARTS);
  });

  describe('getDomain()', () => {
    it('gets domain mapping for getToken() operation', () => {
      expect(orders.getDomain(operationKeys.GET_BT_TOKEN)).to.be.equal(DOMAINS.CARPARTS);
    });
  });

  describe('getByOrderId()', () => {
    itOrSkip('gets order details for cart', ORDER_ID, (done) => {
      orders.forCart(ORDER_ID).then((result) => {
        expect(result).to.have.property('orderId', String(ORDER_ID));
        expect(result).to.include.all.keys([
          'orderStatus',
          'orderDate',
          'lastModified',
          'items',
          'summary',
          'appliedCoupon',
        ]);

        done();
      }).catch(done);
    });

    itOrSkip('gets order details for checkout', ORDER_ID, (done) => {
      orders.forCheckout(ORDER_ID).then((result) => {
        expect(result).to.have.property('orderId', String(ORDER_ID));
        expect(result).to.include.all.keys([
          'orderStatus',
          'orderDate',
          'lastModified',
          'items',
          'summary',
          'customer',
          'shipment',
          'country',
          'states',
        ]);

        done();
      }).catch(done);
    });

    itOrSkip('gets order details for checkout confirmation pages', ORDER_ID, (done) => {
      orders.forCheckoutConfirmation(ORDER_ID).then((result) => {
        expect(result).to.have.property('orderId', String(ORDER_ID));
        expect(result).to.include.all.keys([
          'orderStatus',
          'orderDate',
          'lastModified',
          'items',
          'summary',
          'customer',
          'shipment',
        ]);

        done();
      }).catch(done);
    });
  });

  itOrSkip('gets shipping methods of an order', ORDER_ID, (done) => {
    orders.shippingMethods(ORDER_ID, {
      price_level: 'price4',
      shipping_level: 'shipping',
      handling_level: 'handling',
      use_dynamic_shipping: 1,
      dsc_version: 1,
      free_shipping: 0,
      restrictedZipCode: 1,
      apo_fpo: 1,
      po_box: 1,
    }).then((result) => {
      expect(result).to.include.all.keys(['shipmentMethods', 'hasRestrictedZipCode']);

      done();
    }).catch(done);
  });

  it('gets brain tree token', (done) => {
    orders.getToken()
      .then((token) => {
        expect(token).to.have.property('tokenizationKey');
        done();
      })
      .catch(done);
  });
});
