import BaseModel from './BaseModel';

export default class AccountSettingModel extends BaseModel {
  /**
   * AccountSettingModel Model
   * @param {String} firstName
   * @param {String} lastName
   * @param {String} emailAddress
   * @param {Integer} emailPromotional
   *
   */
  constructor(ds) {
    super();
    this.firstName = ds.firstName;
    this.lastName = ds.lastName;
    this.emailAddress = ds.emailAddress;
    this.emailPromotional = ds.emailPromotional;
  }
}
