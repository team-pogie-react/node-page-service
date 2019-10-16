import { each } from 'lodash';
import BaseFormatter from './BaseFormatter';
import { ApiError } from '../../../errors';

export default class Cloudinary extends BaseFormatter {
  /** @inheritdoc */
  url(text, domain, opts = {}) {
    if (!this.helper.isString(text)) {
      return null;
    }

    const dir = opts.dir || 'images';
    const defaultImage = 'd_noimage.jpg';
    const baseUrl = this.helper.getImageBaseUrl(domain);
    const encoded = this._encodeForImageUrl(text, opts.isImageSet);

    return `${baseUrl}/upload/${defaultImage}/${dir}/${encoded}.jpg`;
  }

  /** @inheritdoc */
  set(text, domain) {
    return new Promise((resolve, reject) => {
      const baseUrl = this.helper.getImageBaseUrl(domain);
      const encoded = this._encodeForImageSet(text);

      this.http.get(`${baseUrl}/list/sku:${encoded}.json`)
        .then((response) => {
          const { data } = response;

          resolve(this._formatSet(data, domain));
        })
        .catch(error => reject(new ApiError(error.message)));
    });
  }

  /**
   * Encode the text and check for replacements for sku.
   *
   * @param {String} text
   * @param {Boolean} isImageSet
   *
   * @returns {String}
   */
  _encodeForImageUrl(text, isImageSet = false) {
    if (isImageSet === true || this._isImageSet(text)) {
      return text.toLowerCase().replace('_is', '_1');
    }

    return this.helper.encodeToLower(text);
  }

  /**
   * Determine if text is for image set.
   *
   * @param {String} text
   *
   * @returns {Boolean}
   */
  _isImageSet(text) {
    return text.indexOf('_is') !== -1;
  }

  /**
   * Encode the text and check for replacements for image set.
   *
   * @param {String} text
   *
   * @returns {String}
   */
  _encodeForImageSet(text) {
    if (this._isImageSet(text)) {
      return text.toLowerCase().replace('_is', '');
    }

    return this.helper.encodeToLower(text);
  }

  /**
   * Format image set for scene7.
   *
   * @example result
   * {
   *  "resources": [{
   *    "public_id": "images/gm24er_mb",
   *    "version": 1561089331,
   *    "format": "jpg",
   *    "width": 4811,
   *    "height": 2478,
   *    "type": "upload",
   *    "created_at": "2019-06-21T03:55:31Z"
   * }]
   * }
   *
   * @param {String} result
   * @param {String} domain
   *
   * @returns {Array}
   */
  _formatSet(result, domain) {
    const urls = [];
    const sets = result.resources || [];

    each(sets, (set) => {
      const base = set.public_id.split('/');

      urls.push(this.url(base[1], domain, { isImageSet: true }));
    });

    return urls;
  }
}
