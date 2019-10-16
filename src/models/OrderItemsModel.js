import BaseModel from './BaseModel';

export default class OrderItemsModel extends BaseModel {
  /**
   * OrderItemsModel Model
   * @param {String} oid
   * @param {String} title
   * @param {<Image>} image
   * @param {String} partNumber
   * @param {String} price
   * @param {String} regularPrice
   * @param {String} shippingMethod
   * @param {<VehicleModel>} vehicle
   * @param {<ShippingExpectationModel>} shippingExpectation
   *
   */

  constructor(ds) {
    super();
    this.oid = ds.oid;
    this.title = ds.title;
    this.image = ds.image;
    this.partNumber = ds.partNumber;
    this.qty = ds.qty;
    this.price = ds.price;
    this.regularPrice = ds.regularPrice;
    this.cpp = ds.cpp;
    this.corePrice = ds.corePrice;
    this.shippingMethod = ds.shippingMethod;
    this.shippingMethodCode = ds.shippingMethodCode;
    this.shippingCompany = ds.shippingCompany;
    this.trackingNumber = ds.trackingNumber;
    this.trackingUrl = ds.trackingUrl;
    this.vehicle = ds.vehicle;
    this.shippingExpectation = ds.shippingExpectation;
  }
}
