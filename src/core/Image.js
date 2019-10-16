import scene7 from './library/image/Scene7';
import cloudinary from './library/image/Cloudinary';

export default class Image {
  /**
   * Static image sources.
   *
   * @readonly
   * @static
   *
   * @returns {Object}
   */
  static get SOURCES() {
    return {
      scene7,
      cloudinary,
    };
  }

  /**
   * Transform text to an image url.
   *
   * @param {String} text
   * @param {String} domain
   * @param {Object} opts
   *
   * @returns {String}
   */
  static url(text, domain, opts = {}) {
    const formatter = this._formatter();

    return formatter.url(text, domain, opts);
  }

  /**
   * Get urls for image set of the text given.
   *
   * @param {String} text
   * @param {String} domain
   *
   * @returns {Promise<Array>}
   */
  static set(text, domain) {
    const formatter = this._formatter();

    return formatter.set(text, domain);
  }

  /**
   * Get a formatter method.
   *
   * @returns {Function}
   */
  static _formatter() {
    const source = process.env.IMAGE_SOURCE;

    if (!this.SOURCES[source]) {
      throw new TypeError(`Invalid "IMAGE_SOURCE", ${source}`);
    }

    return new this.SOURCES[source]();
  }
}
