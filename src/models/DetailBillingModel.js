import BaseModel from './BaseModel';

export default class DetailBillingModel extends BaseModel {
  /**
   * DetailBillingModel Model
   * @param {String} paymentMethod
   * @param {String} telephone
   * @param {<AddressModel>} address
   *
   */

  constructor(ds) {
    super();
    this.paymentMethod = ds.paymentMethod;
    this.telephone = ds.telephone;
    this.address = ds.address;
  }
}
