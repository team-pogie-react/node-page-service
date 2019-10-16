/* eslint-env mocha */
import _ from 'lodash';
import { expect } from 'chai';
import stubs from '../../stubs/orderdetails.json';
import CatalogTransformer from '../../../src/transformers/MyAccount/OrderdetailsTransformer';
import {
  AddressModel,
  DetailBillingModel,
  DetailsShippingModel,
  OrderDetailModel,
  OrderSummaryModel,
  OrderItemsModel,
  VehicleModel,
  ShippingExpModel,
} from '../../../src/models';

describe('OrderdetailsTransformer', () => {
  const transformer = new CatalogTransformer();
  const domain = 'carparts.com';

  describe('orderDetails()', () => {
    let result;
    beforeEach(() => {
      result = transformer.orderDetails(stubs.orderDetails, domain);
    });

    it('transformed order details check properties', () => {
      _.each(OrderDetailModel, (key) => {
        expect(result).to.have.property(key);
        expect(result[key]).to.not.be.equal(null);
        expect(result[key]).to.not.be.equal(undefined);
      });

      _.each(DetailsShippingModel, (key) => {
        expect(result.shipping).to.have.property(key);
        expect(result.shipping[key]).to.not.be.equal(null);
        expect(result.shipping[key]).to.not.be.equal(undefined);
      });

      _.each(AddressModel, (key) => {
        expect(result.shipping.address).to.have.property(key);
        expect(result.shipping.address[key]).to.not.be.equal(null);
        expect(result.shipping.address[key]).to.not.be.equal(undefined);
      });

      _.each(DetailBillingModel, (key) => {
        expect(result.billing).to.have.property(key);
        expect(result.billing[key]).to.not.be.equal(null);
        expect(result.billing[key]).to.not.be.equal(undefined);
      });

      _.each(AddressModel, (key) => {
        expect(result.billing.address).to.have.property(key);
        expect(result.billing.address[key]).to.not.be.equal(null);
        expect(result.billing.address[key]).to.not.be.equal(undefined);
      });

      _.each(OrderSummaryModel, (key) => {
        expect(result.orderSummary).to.have.property(key);
        expect(result.orderSummary[key]).to.not.be.equal(null);
        expect(result.orderSummary[key]).to.not.be.equal(undefined);
      });

      _.each(OrderItemsModel, (key) => {
        expect(result.items[0]).to.have.property(key);
        expect(result.items[0][key]).to.not.be.equal(null);
        expect(result.items[0][key]).to.not.be.equal(undefined);
      });
      expect(result.items).to.be.an('array').and.has.lengthOf(stubs
        .orderDetails.results.order.parts.length);
    });

    it('transformed order details check model instance', () => {
      expect(result).to.be.instanceOf(OrderDetailModel);
      expect(result.shipping).to.be.instanceOf(DetailsShippingModel);
      expect(result.billing).to.be.instanceOf(DetailBillingModel);
      expect(result.orderSummary).to.be.instanceOf(OrderSummaryModel);
      expect(result.items[0]).to.be.instanceOf(OrderItemsModel);
    });

    it('transformed order details does not have underscore properties', () => {
      expect(result).not.to.have.property('_orderId');
      expect(result).not.to.have.property('_merchantOrderId');
      expect(result).not.to.have.property('_orderDate');
      expect(result).not.to.have.property('_shipping');
      expect(result).not.to.have.property('_billing');
      expect(result).not.to.have.property('_orderSummary');
      expect(result).not.to.have.property('_items');
    });

    it('transformed order details validate values', () => {
      expect(result.orderId).to.be.equal(stubs.orderDetails.results.order.order_id);
      expect(result.merchantOrderId).to.be.equal(stubs.orderDetails.results
        .order.merchant_order_id);
      expect(result.orderDate).to.be.equal(stubs.orderDetails.results.order.order_date);
      expect(result.orderStatus).to.be.equal(stubs.orderDetails.results.order.order_status);
    });

    it('transformed order details validate shipping', () => {
      const shipping = transformer._transformDetailsShipping(stubs.orderDetails.results.order);
      expect(result.shipping.shippingMethod).to.be.equal(shipping.shippingMethod);
      expect(result.shipping.telephone).to.be.equal(shipping.telephone);
      expect(result.shipping.name).to.be.equal(shipping.name);

      _.each(AddressModel, (key) => {
        expect(result.shipping.address[key]).to.be.equal(shipping.address[key]);
      });
    });

    it('transformed order details validate billing', () => {
      const billing = transformer._transformDetailsBilling(stubs.orderDetails.results.order);
      expect(result.billing.paymentMethod).to.be.equal(billing.paymentMethod);
      expect(result.billing.telephone).to.be.equal(billing.telephone);

      _.each(AddressModel, (key) => {
        expect(result.billing.address[key]).to.be.equal(billing.address[key]);
      });
    });

    it('transformed order details validate orderSummary', () => {
      const orderSummary = transformer._tranformOrderSummary(stubs.orderDetails.results.order);
      _.each(OrderSummaryModel, (key) => {
        expect(result.orderSummary[key]).to.be.equal(orderSummary[key]);
      });
    });

    it('transformed order details validate items', () => {
      const orderItem = transformer._transformOrderItems(stubs.orderDetails.results.order);

      expect(result.items[0].oid).to.be.equal(orderItem[0].oid);
      expect(result.items[0].title).to.be.equal(orderItem[0].title);
      expect(result.items[0].image).to.be.equal(orderItem[0].image);
      expect(result.items[0].partNumber).to.be.equal(orderItem[0].partNumber);
      expect(result.items[0].price).to.be.equal(orderItem[0].price);
      expect(result.items[0].regularPrice).to.be.equal(orderItem[0].regularPrice);
      expect(result.items[0].shippingMethod).to.be.equal(orderItem[0].shippingMethod);

      _.each(VehicleModel, (key) => {
        expect(result.items[0].vehicle[key]).to.be.equal(orderItem[0].vehicle[key]);
      });

      _.each(ShippingExpModel, (key) => {
        expect(result.items[0].shippingExpectation[key]).to.be.equal(orderItem[0]
          .shippingExpectation[key]);
      });
    });
  });
});
