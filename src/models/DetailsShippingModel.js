import BaseModel from './BaseModel';

export default class DetailsShippingModel extends BaseModel {
  /**
   * DetailsShipping Model
   * @param {String} shippingMethod
   * @param {String} telephone
   * @param {String} name
   * @param {<AddressModel>} address
   */

  constructor(ds) {
    super();
    this.shippingMethod = ds.shippingMethod;
    this.telephone = ds.telephone;
    this.name = ds.name;
    this.address = ds.address;
  }
}
