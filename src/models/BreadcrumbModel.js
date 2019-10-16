import BaseModel from './BaseModel';

export default class BreadcrumbModel extends BaseModel {
  /**
   * Breadcrumb Model
   * @param {String} text
   * @param {String} value
   *
   */

  constructor(ds) {
    super();
    this._text = this.isStr(ds.text);
    this._value = this.isStr(ds.value);
  }

  /**
   * Getter text
   * @return {String} text
   *
  */
  get text() {
    return this._text;
  }

  /**
   * Getter value
   * @return {String} text
   *
  */
  get value() {
    return this._value;
  }

  /**
   * Setter text
   * @param {String} text
   *
  */
  set text(val) {
    this._text = this.isStr(val);
  }

  /**
   * Setter text
   * @param {String} text
   *
  */
  set value(val) {
    this._value = this.isStr(val);
  }
}
