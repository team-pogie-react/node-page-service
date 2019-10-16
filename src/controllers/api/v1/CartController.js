import Promise from 'bluebird';
import _ from 'lodash';
import Order from '../../../services/Order';
import Vehicle from '../../../services/Vehicle';
import Meta from '../../../services/Meta';
import Metas from '../../../configs/services/metas';
import BaseController from '../BaseController';
import Category from '../../../services/Category';
import WIDGETS from '../../../configs/services/widgets';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import { compositeErrorHandler } from '../../../errors/handlers';

export default class CartController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    this.order = new Order();
    this.vehicles = new Vehicle();
    this.metas = new Meta();
    this.categories = new Category();
    this.widgets = new StrapiWidget();
  }

  /**
   * Aggregate api responses for cart page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async getByOrderId(request, response) {
    try {
      const domain = this.getDomain(request);
      const orderId = this.getOrderId(request);
      const overrides = this.getOverrides(request);

      if (!_.isUndefined(overrides.customer_id) && overrides.customer_id.indexOf('00') !== 0) {
        overrides.merge = true;
      } else {
        overrides.merge = false;
      }

      const result = await Promise.all(this._aggregatedCart(domain, orderId, overrides))
        .then(([meta, widgets, navigationCategories, orders, years]) => Promise.resolve({
          meta,
          widgets,
          navigationCategories,
          orders,
          years,
          pageType: WIDGETS.CART_PAGE,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Display get quote
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async getQuote(request, response) {
    try {
      const domain = this.getDomain(request);
      const result = await Promise.all(this._aggregatedGetQuote(domain))
        .then(([meta, widgets, navigationCategories, pageType]) => Promise.resolve({
          meta,
          widgets,
          navigationCategories,
          pageType,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Display save quote
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async saveQuote(request, response) {
    try {
      const domain = this.getDomain(request);
      const result = await Promise.all(this._aggregatedSaveQuote(domain))
        .then(([meta, widgets, navigationCategories, pageType]) => Promise.resolve({
          meta,
          widgets,
          navigationCategories,
          pageType,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Get Quote
   * @param domain
   * @returns {(*|Promise<T | never>|void)[]}
   * @private
   */
  _aggregatedGetQuote(domain) {
    const categories = this.categories.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage(Metas.GET_QUOTE).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.GET_QUOTE).catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      WIDGETS.GET_QUOTE,
    ];
  }

  /**
   * Save Quote
   * @param domain
   * @returns {(*|Promise<T | never>|void)[]}
   * @private
   */
  _aggregatedSaveQuote(domain) {
    const categories = this.categories.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage(Metas.SAVE_QUOTE).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.SAVE_QUOTE).catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      WIDGETS.SAVE_QUOTE,
    ];
  }

  /**
   * Aggregate service calls for cart page.
   *
   * @param {String} domain
   * @param {Integer} orderId
   *
   * @return {Array}
   */
  _aggregatedCart(domain, orderId, overrides) {
    const orders = this.order.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const metas = this.metas.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const categories = this.categories.setDomain(domain);

    return [
      metas.getByPage(Metas.CART).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.CART_PAGE).catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      orders.forCart(orderId, overrides).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
    ];
  }
}
