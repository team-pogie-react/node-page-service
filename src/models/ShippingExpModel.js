import BaseModel from './BaseModel';

export default class ShippingExpectationModel extends BaseModel {
  /**
   * Shipping Expectation Model
   * @param {String} ETA
   *
   */

  constructor(ds) {
    super();
    this.ETA = ds.ETA;
  }
}
