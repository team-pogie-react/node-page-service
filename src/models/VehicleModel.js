import BaseModel from './BaseModel';

export default class VehicleModel extends BaseModel {
  /**
   * Vehicle Model
   * @param {String} year
   * @param {String} make
   * @param {String} model
   * @param {String} submodel
   * @param {String} engine
   *
   */

  constructor(ds) {
    super();
    this.year = ds.year;
    this.make = ds.make;
    this.model = ds.model;
    this.submodel = ds.submodel;
    this.engine = ds.engine;
  }
}
