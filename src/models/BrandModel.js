import BaseModel from './BaseModel';

export default class BrandModel extends BaseModel {
  /**
   * BrandModel Model
   * @param {String} text
   * @param {String} url
   * @param {String} domain
   *
   */
  constructor(ds) {
    super();
    this._text = this.isStr(ds.text);
    this._url = this.isStr(ds.url);
    this._image = this.isStr(ds.image);
  }

  /**
   * Return string text
   *
   * @returns {String} Text
  */
  get text() {
    return this._text;
  }

  /**
   * Return string url
   *
   * @returns {String} url
  */
  get url() {
    return this._value;
  }

  /**
   * Set array image
   *
   * @returns {String} image
  */
  get image() {
    return this._image;
  }

  /**
   * Set string text
   *
   * @param {String} text
  */
  set text(val) {
    this._text = this.isStr(val);
  }

  /**
   * Set string url
   *
   * @param {String} url
  */
  set url(val) {
    this.url = this.isStr(val);
  }

  /**
   * Set string image
   *
   * @param {String} image
  */
  set image(val) {
    this._image = this.isStr(val);
  }
}
