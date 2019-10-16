import BaseModel from './BaseModel';

export default class AddressModel extends BaseModel {
  /**
   * Address Model
   * @param {String} streetAddress
   * @param {String} city
   * @param {String} postcode
   * @param {String} provice
   * @param {String} suburbAddress
   * @param {String} state
   * @param {String} country
   *
   */

  constructor(ds) {
    super();
    this.streetAddress = ds.streetAddress;
    this.city = ds.city;
    this.postcode = ds.postcode;
    this.province = ds.province;
    this.suburbAddress = ds.suburbAddress;
    this.state = ds.state;
    this.country = ds.country;
  }
}
