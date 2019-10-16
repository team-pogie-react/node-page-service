import BaseModel from './BaseModel';

export default class OrderSummaryModel extends BaseModel {
  /**
   * OrderSummaryModel Model
   * @param {String} subtotal
   * @param {String} totalShipping
   * @param {String} totalHandling
   * @param {String} totalTax
   * @param {String} totalDiscount
   * @param {String} totalWarranty
   * @param {String} totalCorePrice
   * @param {String} total
   *
   */

  constructor(ds) {
    super();
    this.subtotal = ds.subtotal;
    this.totalShipping = ds.totalShipping;
    this.totalHandling = ds.totalHandling;
    this.totalTax = ds.totalTax;
    this.totalDiscount = ds.totalDiscount;
    this.totalWarranty = ds.totalWarranty;
    this.totalCorePrice = ds.totalCorePrice;
    this.total = ds.total;
  }
}
