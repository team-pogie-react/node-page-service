/* eslint-disable no-unused-vars */
import axios from 'axios';
import { isString } from 'lodash';
import { encodeToLower, getImageBaseUrl } from '../../helpers';

export default class BaseFormatter {
  /**
   * Create BaseFormatter instance.
   */
  constructor() {
    this.helper = { isString, encodeToLower, getImageBaseUrl };
    this.http = axios.create({
      timeout: parseInt(process.env.HTTP_CLIENT_TIMEOUT, 10),
    });
  }

  /**
   * Convert text to image url.
   *
   * @param {String} text
   * @param {String} domain
   * @param {Object} opts
   *
   * @returns {String}
   */
  url(text, domain, opts = {}) {
    throw new Error('Not implemented.');
  }

  /**
   * Get urls for image set of the text given.
   *
   * @param {String} text
   * @param {String} domain
   * @param {Object} opts
   *
   * @returns {Promise<Array>}
   */
  set(text, domain) {
    throw new Error('Not implemented.');
  }
}
