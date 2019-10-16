import qs from 'qs';
import { _ } from 'lodash';
import BaseFormatter from './BaseFormatter';
import { ApiError } from '../../../errors';

export default class Scene7 extends BaseFormatter {
  /** @inheritdoc */
  url(text, domain, opts = {}) {
    if (!this.helper.isString(text)) {
      return null;
    }

    const query = { defaultImage: 'noimage' };
    const baseUrl = this.helper.getImageBaseUrl(domain);
    const { width, height } = opts;

    if (width && height) {
      query.wid = width;
      query.hei = height;
    }

    const urlQuery = qs.stringify(query);

    return `${baseUrl}/${this.helper.encodeToLower(text)}?${urlQuery}`;
  }

  /** @inheritdoc */
  set(text, domain) {
    return new Promise((resolve, reject) => {
      const baseUrl = this.helper.getImageBaseUrl(domain);
      const encoded = this.helper.encodeToLower(text);
      const query = qs.stringify({ req: 'imageSet' });

      this.http.get(`${baseUrl}/${encoded}?${query}`)
        .then((response) => {
          const { data } = response;

          resolve(this._formatSet(data));
        })
        .catch(error => reject(new ApiError(error.message)));
    });
  }

  /**
   * Format image set for scene7.
   *
   * @example result
   * "Autos/gm24er_1;Autos/gm24er_1,Autos/gm24er_2;Autos/gm24er_2"
   *
   * @param {String} result
   *
   * @returns {Array}
   */
  _formatSet(result) {
    const urls = [];

    _(result).split(',').each((set) => {
      const url = set.split(';')[0].split('/')[1];

      urls.push(this.url(url));
    });

    return urls;
  }
}
