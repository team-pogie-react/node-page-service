import _ from 'lodash';
import Image from '../core/Image';

export default class OrderTransformer {
  /**
   * Transform orderData order api response.
   *
   * @param {Object} orderData
   * @param {String} domain
   *
   * @returns {Object}
   */
  transformBasketOrder(orderData, domain) {
    if (!_.isObject(orderData)) {
      return {};
    }

    const discountInfo = {
      discountInfo: this._transformOrderDiscountInfo(orderData.discountInfo),
    };

    const couponMsg = {
      couponMsg: this._transformOrderCouponMsg(orderData.discountInfo),
    };

    const discount = {
      discount: this._transformOrderDiscount(orderData.discount),
    };

    const shipment = {
      shipment: this._transformOrderShipment(orderData.shipment),
    };

    const payment = {
      payment: this._transformOrderPayment(orderData.payment),
    };

    const merged = {
      merged: orderData.merged,
    };

    return _.merge(this._transformBaseOrder(orderData, domain),
      discountInfo,
      discount,
      couponMsg,
      shipment,
      payment,
      merged);
  }

  /**
   * Transform orderData order api response.
   *
   * @param {Object} orderData
   * @param {String} domain
   *
   * @returns {Object}
   */
  transformCheckoutOrder(orderData, domain) {
    if (!_.isObject(orderData)) {
      return {};
    }

    const checkout = {
      country: this._transformOrderCountry(orderData.country),
      states: this._transformOrderState(orderData.states),
      shipNot: this._transformOrderItems(orderData.shipnot, domain),
      poboxRegex: this._transformOrderPoBoxRegex(orderData.poboxRegex),
    };

    return _.merge(this.transformCheckoutConfirmation(orderData, domain), checkout);
  }

  /**
   * Transform orderData order api response for checkout confirmation.
   *
   * @param {Object} orderData
   * @param {String} domain
   *
   * @returns {Object}
   */
  transformCheckoutConfirmation(orderData, domain) {
    if (!_.isObject(orderData)) {
      return {};
    }
    const checkout = {
      customer: this._transformOrderCustomer(orderData.customer),
      shipment: this._transformOrderShipment(orderData.shipment),
      payment: this._transformOrderPayment(orderData.payment),
    };

    return _.merge(this._transformBaseOrder(orderData, domain), checkout);
  }

  /**
   * Transform shipping methods.
   *
   * @param {Object} result
   *
   * @returns {Object}
   */
  transformShippingMethods(result) {
    if (!_.isObject(result)) {
      return [];
    }

    const shipmentMethods = [];
    const methods = !_.isUndefined(result.shipmentMethod) ? result.shipmentMethod : result;
    const hasRestrictedZipCode = result.hasRestrictedZipCode || [];

    _.each(methods, (item) => {
      shipmentMethods.push({
        method: item.method,
        totalShipping: item.totalShipping,
        totalHandling: item.totalHandling,
        methodName: item.methodName,
        feMethodName: item.feMethodName,
      });
    });

    return { shipmentMethods, hasRestrictedZipCode };
  }

  /**
   * Transform the Brain Tree token.
   *
   * @param {Object} result
   *
   * @returns {Object}
   */
  transformToken(result) {
    if (!_.isObject(result)) {
      return {};
    }

    return { tokenizationKey: result.tokenization_key };
  }

  /**
   * Base order transformation.
   *
   * @param {Object} orderData
   * @param {String} domain
   *
   * @return {Object}
   */
  _transformBaseOrder(orderData, domain) {
    const { order } = orderData;

    return {
      orderId: _.parseInt(order.orderId),
      newOrderId: !_.isUndefined(order.newOrderId) ? _.parseInt(order.newOrderId) : '',
      orderStatus: _.parseInt(order.orderStatus),
      merchantOrderId: order.merchantOrderId + order.orderId,
      orderDate: order.orderDate,
      lastModified: order.lastModified,
      items: this._transformOrderItems(orderData.orderItems, domain),
      summary: this._transformOrderSummary(order),
    };
  }

  /**
   * Transform the order items recursively.
   * We reassign the "order_items" param to "items"
   * eslint error "no parameter re-assign".
   *
   * @param {Object|Array} order
   * @param {String} domain
   *
   * @returns {Array}
   */
  _transformOrderItems(items, domain) {
    const result = [];

    _.each(items, (value) => {
      const { sku, qty } = value;

      result.push({
        pid: value.pId,
        orderItemId: _.parseInt(value.orderItemId),
        title: value.skuTitle,
        image: Image.url(`${sku}_is`, domain),
        skuNumber: sku,
        vendorSku: value.vendorSku,
        productId: value.productId,
        part: value.partname,
        brand: value.brand,
        description: !_.isUndefined(value.brand) && _.lowerCase(value.brand) === 'lloyd mats' ? value.description : '',
        mfrNumber: '',
        isUniversal: Boolean(parseInt(value.universal, 10)),
        isVehicleFit: Boolean(parseInt(value.isfit, 10)),
        reqSe: value.reqse,
        shipping: parseFloat(value.shipping).toFixed(2),
        handling: parseFloat(value.handling).toFixed(2),
        listPrice: parseFloat(value.listPrice).toFixed(2),
        corePrice: parseFloat(value.core).toFixed(2),
        total: parseFloat(value.listPrice * qty).toFixed(2),
        quantity: _.parseInt(qty),
        warrantyPrice: parseFloat(value.itemWarrantyAmount).toFixed(2),
        warrantyCode: value.itemWarrantyCode,
        protectionPlan: this._transformProtectionPlan(value.customerProtectionPlan),
        vehicle: {
          year: value.modelYear,
          make: value.makeText,
          model: value.modelText,
          submodel: value.submodel,
          engine: value.engine,
        },
      });
    });

    return _.orderBy(result, ['orderItemId'], ['asc']);
  }

  /**
   * Transform order item warranty.
   *
   * @param {Object|Undefined} warranty
   *
   * @returns {Object}
   */
  _transformProtectionPlan(warranty) {
    if (_.isEmpty(warranty)) {
      return {};
    }

    return {
      warrantyPrice: parseFloat(warranty.value.price).toFixed(2),
      warrantyCode: warranty.value.code,
      warrantyType: _.replace(warranty.value.type, '_', ' '),
    };
  }

  /**
   * Transform the order summary.
   * We reassign the "order" node to "summary"
   * eslint error "no parameter re-assign".
   *
   * @param {Object|Array} order
   *
   * @returns {Array}
   */
  _transformOrderSummary(order) {
    return {
      subtotal: parseFloat(order.subTotal).toFixed(2),
      totalShipping: parseFloat(order.totalShipping).toFixed(2),
      totalHandling: parseFloat(order.totalHandling).toFixed(2),
      totalTax: parseFloat(order.totalTax).toFixed(2),
      totalDiscount: parseFloat(order.totalDiscount).toFixed(2),
      totalWarranty: parseFloat(order.totalWarranty).toFixed(2),
      totalCorePrice: parseFloat(order.totalCore).toFixed(2),
      total: parseFloat(order.total).toFixed(2),
    };
  }

  /**
   * Transform the order discount info.
   * We reassign the "discount_info" node to "appliedCoupon"
   *
   * @param {Object} info
   *
   * @returns {Object}
   */
  _transformOrderDiscountInfo(info) {
    if (!_.isObject(info)) {
      return {};
    }

    const { coupons, messages } = info;

    return {
      coupons,
      messages: messages.primaryMessage,
    };
  }

  /**
   * Transform the order discount.
   * We reassign the "discount_info" node to "appliedCoupon"
   *
   * @param {Object} info
   *
   * @returns {Object}
   */
  _transformOrderDiscount(discount) {
    if (!_.isObject(discount)) {
      return {};
    }

    return discount;
  }

  /**
   * Transform the order coupon messages.
   * We reassign the "discount_info" node to "appliedCoupon"
   *
   * @param {Object} info
   *
   * @returns {Object}
   */
  _transformOrderCouponMsg(discountInfo) {
    if (!_.isObject(discountInfo)) {
      return {};
    }

    const couponMsg = {};

    if (typeof discountInfo.messages !== 'undefined') {
      if (!_.isEmpty(discountInfo.messages.primaryMessage)) {
        const invalidMsg = [];
        const successMsg = [];

        _.each(discountInfo.messages.primaryMessage, (value) => {
          if (value.indexOf('applied') !== -1 || value.indexOf('active') !== -1) {
            successMsg.push(value);
          } else {
            invalidMsg.push(value);
          }
        });

        couponMsg.success = successMsg;
        couponMsg.invalid = invalidMsg;
      }

      if (!_.isEmpty(discountInfo.messages.other)) {
        const listMsg = [];

        _.each(discountInfo.messages.other, (value) => {
          listMsg.push(value);
        });

        couponMsg.list = listMsg;
      }
    }

    return couponMsg;
  }

  /**
   * Transform the order customer.
   * We reassign the "customer" node to "customer"
   *
   * @param {Object} customer
   *
   * @returns {Array}
   */
  _transformOrderCustomer(customer) {
    return {
      customerId: _.parseInt(customer.customerId),
      customerFirstName: customer.customerFirstName,
      customerLastName: customer.customerLastName,
      customerCompany: customer.customerCompany,
      customerStreetAddress: customer.customerStreetAddress,
      customerSuburbAddress: customer.customerSuburbAddress,
      customerCity: customer.customerCity,
      customerPostcode: customer.customerPostcode,
      customerProvince: customer.customerProvince,
      customerState: customer.customerState,
      customerCountry: customer.customerCountry,
      customerTelephone: customer.customerTelephone,
      customerEmailAddress: customer.customerEmailAddress,
      customerBirthday: customer.customerBirthday,
      mgrCustomerId: _.parseInt(customer.mgrCustomerId),
      customerMgrUsername: customer.customerMgrUsername,
      tokenNumber: customer.tokenNumber,
    };
  }

  /**
   * Transform the order shipment.
   *
   * @param {Array} shipments
   *
   * @returns {Array}
   */
  _transformOrderShipment(shipments) {
    if (!_.isArray(shipments)) {
      return [];
    }

    const items = [];

    _.each(shipments, (item) => {
      items.push({
        shipmentId: _.parseInt(item.shipmentId),
        shippingMethod: item.shippingMethod,
        shippingMethodFreeTwoday: item.shippingMethodFreeTwoday,
        deliveryName: item.deliveryName,
        deliveryCompany: item.deliveryCompany,
        deliveryStreetAddress: item.deliveryStreetAddress,
        deliverySuburbAddress: item.deliverySuburbAddress,
        deliveryCity: item.deliveryCity,
        deliveryPostcode: item.deliveryPostcode,
        deliveryProvince: item.deliveryProvince,
        deliveryState: item.deliveryState,
        deliveryCountry: item.deliveryCountry,
        deliveryTelephone: item.deliveryTelephone,
        deliveryEmailAddress: item.deliveryEmailAddress,
        shipmentPackage: this._transformShipmentPackage(item.shipmentPackage),
        shippingMethodId: item.shippingMethodId,
      });
    });

    return items;
  }

  /**
   * Transform shipment package node.
   *
   * @param {Array} items
   *
   * @returns {Array}
   */
  _transformShipmentPackage(items) {
    if (_.isEmpty(items)) {
      return [];
    }

    const result = [];

    _.each(items, (item) => {
      result.push({ orderItemId: _.parseInt(item.orderItemId) });
    });

    return result;
  }

  /**
   * Transform the order states.
   * We reassign the "states" node to "states"
   * eslint error "no parameter re-assign".
   *
   * @param {Array} states
   *
   * @returns {Array}
   */
  _transformOrderState(states) {
    const result = [];

    _.each(states, (countryStates, countryCode) => {
      const statesArr = [];

      _.each(countryStates, (stateName, stateCode) => {
        statesArr.push({ code: stateCode, name: stateName });
      });

      result.push({ countryCode, countryStates: statesArr });
    });

    return result;
  }

  /**
   * Transform the order countries.
   * We reassign the "country" node to "country"
   * eslint error "no parameter re-assign".
   *
   * @param {Array} countries
   *
   * @returns {Array}
   */
  _transformOrderCountry(countries) {
    const result = [];

    _.each(countries, (countryName, countryCode) => {
      result.push({ code: countryCode, name: countryName });
    });

    return result;
  }

  /**
   * Transform the order shipment.
   *
   * @param {Array} shipments
   *
   * @returns {Array}
   */
  _transformOrderPayment(payments) {
    if (_.isEmpty(payments.payment)) {
      return [];
    }

    return {
      paymentId: _.parseInt(payments.payment.paymentId),
      paymentMethod: payments.payment.paymentMethod,
      enableCCpreauth: payments.payment.enableCCpreauth,
      orderId: payments.payment.orderId,
      amount: payments.payment.amount,
    };
  }

  /**
   * Transform PO Box Regex.
   *
   * @param {Array} poboxregex
   *
   * @returns {Array}
   */
  _transformOrderPoBoxRegex(poboxregex) {
    if (_.isEmpty(poboxregex)) {
      return [];
    }

    return poboxregex;
  }
}
