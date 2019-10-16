/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import { expect } from 'chai';
import { hydraOrder, shippingMethods, brainTreeToken } from '../../stubs/orders';
import OrderTransformer from '../../../src/transformers/OrderTransformer';

describe('OrderTransformer', () => {
  const transformer = new OrderTransformer();
  const summaryKeys = [
    'total',
    'totalShipping',
    'totalHandling',
    'totalTax',
    'totalDiscount',
    'totalWarranty',
    'totalCorePrice',
    'subtotal',
  ];
  const ORDER_ID = _.parseInt(hydraOrder.order.order_id);

  it('transforms order for cart', () => {
    const result = transformer.transformBasketOrder(hydraOrder);

    expect(result).to.have.property('orderId', ORDER_ID).that.is.an('number');
    expect(result).to.include.all.keys([
      'orderStatus',
      'orderDate',
      'lastModified',
      'items',
      'summary',
      'appliedCoupon',
    ]);

    expect(result.appliedCoupon).to.include.all.keys(['coupons', 'messages']);
    expect(result.appliedCoupon.messages).to.have.lengthOf(2);
    expect(result.items).to.have.lengthOf(1);
    expect(result.items[0]).to.have.property('pid');
    expect(result.items[0]).to.include.all.keys(['orderItemId', 'image', 'title']);
    expect(result.summary).to.be.an('object').and.to.include.all.keys(summaryKeys);
  });

  it('transforms order for checkout', () => {
    const result = transformer.transformCheckoutOrder(hydraOrder);

    expect(result).to.have.property('orderId', ORDER_ID).that.is.an('number');
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

    expect(result.items).to.have.lengthOf(1);
    expect(result.items[0]).to.have.property('pid');
    expect(result.items[0]).to.include.all.keys(['orderItemId', 'image', 'title']);
    expect(result.customer).to.be.an('object').and.to.include.all.keys('customerId');
    expect(result.summary).to.be.an('object').and.to.include.all.keys(summaryKeys);
    expect(result.shipment).to.be.an('array').and.to.have.lengthOf(1);
    expect(result.shipment[0]).to.include.all.keys([
      'shipmentId',
      'shippingMethod',
      'shippingMethodFreeTwoday',
      'deliveryName',
      'deliveryCompany',
      'deliveryStreetAddress',
      'deliverySuburbAddress',
      'deliveryCity',
      'deliveryPostcode',
      'deliveryProvince',
      'deliveryState',
      'deliveryCountry',
      'deliveryTelephone',
      'deliveryEmailAddress',
      'shipmentPackage',
      'shippingMethodId',
    ]);

    expect(result.country).to.be.an('array');
    expect(_.find(result.country, o => o.name === 'AF')).to.be.an('object');
    expect(_.size(result.states)).to.be.equal(2);
  });

  it('transforms order data for checkout confirmation', () => {
    const result = transformer.transformCheckoutConfirmation(hydraOrder);

    expect(result).to.have.property('orderId', ORDER_ID).that.is.an('number');
    expect(result).to.include.all.keys([
      'orderStatus',
      'orderDate',
      'lastModified',
      'items',
      'summary',
      'customer',
      'shipment',
    ]);
    expect(result.items[0]).to.have.property('pid');
    expect(result.items[0]).to.include.all.keys(['orderItemId', 'image', 'title']);
    expect(result.summary).to.be.an('object').and.to.include.all.keys(summaryKeys);
    expect(result.shipment).to.be.an('array').and.to.have.lengthOf(1);
  });

  it('transforms shipping methods', () => {
    const result = transformer.transformShippingMethods(shippingMethods);

    expect(result).to.include.all.keys(['shipmentMethods', 'hasRestrictedZipCode']);
    expect(result.shipmentMethods).to.be.an('array').and.to.have.lengthOf(3);
    expect(result.shipmentMethods[0]).to.include.all.keys([
      'method',
      'methodName',
      'totalShipping',
      'totalHandling',
    ]);
  });

  it('transforms shipping methods with restricted zip code off', () => {
    const result = transformer.transformShippingMethods(shippingMethods.shipment_method);

    expect(result).to.include.all.keys(['shipmentMethods', 'hasRestrictedZipCode']);
    expect(result.shipmentMethods).to.be.an('array').and.to.have.lengthOf(3);
    expect(result.hasRestrictedZipCode).to.be.an('array');
    expect(result.shipmentMethods[0]).to.include.all.keys([
      'method',
      'methodName',
      'totalShipping',
      'totalHandling',
    ]);
  });

  it('transforms brain tree token response', () => {
    const result = transformer.transformToken(brainTreeToken);
    expect(result).to.have.property('tokenizationKey').that.is.not.empty;
  });
});
