import Promise from 'bluebird';
import Meta from '../../../services/Meta';
import Metas from '../../../configs/services/metas';
import Category from '../../../services/Category';
import Order from '../../../services/Order';
import BaseController from '../BaseController';
import Qas from '../../../services/Quickaddress';
import WIDGETS from '../../../configs/services/widgets';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import { compositeErrorHandler } from '../../../errors/handlers';

export default class CheckoutController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    this.order = new Order();
    this.categories = new Category();
    this.metas = new Meta();
    this.widgets = new StrapiWidget();
    this.quickaddress = new Qas();
  }

  /**
   * Aggregate api responses for checkout page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async checkout(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderId = this.getOrderId(request);
      const overrides = this.getOverrides(request);

      const result = await Promise
        .all(this._aggregatedCheckoutBilling(domain, orderId, overrides))
        .then(([meta, widgets, orders, shippingMethods, token]) => Promise.resolve({
          meta,
          widgets,
          orders,
          shippingMethods,
          braintree: token,
          pageType: WIDGETS.CHECKOUT_PAGE,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate api responses for qas page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async qas(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderId = this.getOrderId(request);
      const overrides = this.getOverrides(request);
      const { query } = request;
      const qasParams = {
        postcode: query.postcode,
        street: query.street,
        suburb: query.suburb,
        city: query.city,
        state: query.state,
        country: query.country,
        srm: query.srm,
      };

      const result = await Promise
        .all(this._aggregatedCheckoutQas(domain, orderId, qasParams, overrides))
        .then(([meta, widgets, orders, verify, refine]) => Promise.resolve({
          meta,
          widgets,
          orders,
          verify,
          refine,
          pageType: WIDGETS.CHECKOUT_QAS,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate api responses for checkout page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async review(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderId = this.getOrderId(request);
      const overrides = this.getOverrides(request);

      const result = await Promise
        .all(this._aggregatedCheckoutReview(
          domain, orderId, overrides, WIDGETS.CHECKOUT_REVIEW,
        ))
        .then(([meta, widgets, orders]) => Promise.resolve({
          meta, widgets, orders, pageType: WIDGETS.CHECKOUT_REVIEW,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate api responses for checkout page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async payment(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderId = this.getOrderId(request);
      const overrides = this.getOverrides(request);
      const result = await Promise
        .all(this._aggregatedCheckoutPayment(domain, orderId, overrides))
        .then(([meta, widgets, orders, shippingMethods, token]) => Promise.resolve({
          meta,
          widgets,
          orders,
          shippingMethods,
          braintree: token,
          pageType: WIDGETS.CHECKOUT_PAYMENT,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate api responses for checkout page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async confirmation(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderId = this.getOrderId(request);
      const overrides = this.getOverrides(request);
      const result = await Promise
        .all(this._aggregatedCheckoutConfirmation(
          domain, orderId, overrides, WIDGETS.CHECKOUT_CONFIRMATION,
        ))
        .then(([meta, navigationCategories, widgets, orders]) => Promise.resolve({
          meta, navigationCategories, widgets, orders, pageType: WIDGETS.CHECKOUT_CONFIRMATION,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate service calls for checkount confirmation pages.
   *
   * @param {String}         domain
   * @param {String|Integer} orderId
   *
   * @return {Array}
   */
  _aggregatedCheckoutConfirmation(domain, orderId, overrides, pageType) {
    const orders = this.order.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const categories = this.categories.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const data = {
      ...overrides,
      dataLock: false,
    };

    return [
      metas.getByPage(Metas.CHECKOUT_CONFIRMATION).catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      widgets.getByPage(pageType).catch(compositeErrorHandler),
      orders.forCheckoutConfirmation(orderId, data).catch(compositeErrorHandler),
    ];
  }

  /**
   * Aggregate service calls for checkout review pages.
   *
   * @param {String}         domain
   * @param {String|Integer} orderId
   *
   * @return {Array}
   */
  _aggregatedCheckoutReview(domain, orderId, overrides, pageType) {
    const orders = this.order.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage(Metas.CHECKOUT_REVIEW).catch(compositeErrorHandler),
      widgets.getByPage(pageType).catch(compositeErrorHandler),
      orders.forCheckoutConfirmation(orderId, overrides).catch(compositeErrorHandler),
    ];
  }

  /**
   * Aggregate service calls for cart page.
   *
   * @param {String}         domain
   * @param {String|Integer} orderId
   * @param {Object}         overrides
   *
   * @return {Array}
   */
  _aggregatedCheckoutBilling(domain, orderId, overrides) {
    const orders = this.order.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage(Metas.CHECKOUT).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.CHECKOUT_PAGE).catch(compositeErrorHandler),
      orders.forCheckout(orderId, overrides).catch(compositeErrorHandler),
      orders.shippingMethods(orderId, overrides).catch(compositeErrorHandler),
      orders.getToken().catch(compositeErrorHandler),
    ];
  }

  /**
   * Aggregate service calls for cart page.
   *
   * @param {String} domain
   * @param {String} orderId
   * @param {Object} overrides
   *
   * @return {Array}
   */
  _aggregatedCheckoutPayment(domain, orderId, overrides) {
    const orders = this.order.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage(Metas.CHECKOUT_PAYMENT).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.CHECKOUT_PAYMENT).catch(compositeErrorHandler),
      orders.forCart(orderId, overrides).catch(compositeErrorHandler),
      orders.shippingMethods(orderId, overrides).catch(compositeErrorHandler),
      orders.getToken().catch(compositeErrorHandler),
    ];
  }

  /**
   * Aggregate service calls for qas page.
   *
   * @param {String} domain
   *
   * @return {Array}
   */
  _aggregatedCheckoutQas(domain, orderId, request, overrides) {
    const orders = this.order.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const verify = this.quickaddress.setDomain(domain);
    const refine = this.quickaddress.setDomain(domain);

    return [
      metas.getByPage(Metas.CHECKOUT_QAS).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.CHECKOUT_QAS).catch(compositeErrorHandler),
      orders.forCheckoutConfirmation(orderId, overrides).catch(compositeErrorHandler),
      verify.verify(orderId, request).catch(compositeErrorHandler),
      typeof request.srm !== 'undefined' ? refine.refine(orderId, request).catch(compositeErrorHandler) : {},
    ];
  }
}
