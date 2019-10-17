import { _, merge } from 'lodash';
import converter from 'number-to-words';
import Content from '../../../services/Content';
import Page from '../../../services/Page';
import Seo from '../../../services/Seo';
import Config from '../../../configs/services/pages';

import BaseController from '../BaseController';
import { isAlphaNumeric, consoler } from '../../../core/helpers';
import Videos from '../../../services/Videos';
import StructuredData from '../../../services/StructuredData';


export default class PagetypeController extends BaseController {
  /**
   * Create controller instance.
   */

  constructor() {
    super();

    this.config = Config || {};
    this.seo = new Seo();
    this.contents = new Content();
    this.page = new Page();
    this.videos = new Videos();
    this.structuredData = new StructuredData();
  }

  /**
   * Construct a class mapping based from the request uri submitted.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @return {Array<Object>}
   */
  async route(request, response) {
    const self = this;
    try {
      const domain = self.getDomain(request);
      let uri = _.get(request, 'query.uri', '');
      const requestUri = _.get(request, 'query.uri', '');
      const tid = _.get(request, 'query.TID', _.get(request, 'query.tid'));

      if (_.isEmpty(uri)) {
        return response.withError('Missing URI parameter', 400);
      }
      uri = uri.substr(1).replace('.html', '');
      consoler('uri', uri);

      const validUri = isAlphaNumeric(uri);
      const validUriBypass = uri.includes('details') || uri.includes('result');
      const result = {};

      // check the validity of uri
      if (validUriBypass === false && validUri === false) { 
        // return an invalid
        return response.withError('Invalid URI', 400);
      }

      // check if exist on redis

      // check if exist on redirector

      // count the dimension
      const dimension = uri.split('/');
      let dimensionCount = dimension.length;

      // get pattern map base from number of dimension
      if (dimension[0] === 'details' || dimension[0] === 'univ') {
        dimensionCount -= 1;
      }

      const pattern = self.config[`${converter.toWords(dimensionCount)}_dimension`];
      consoler('pattern', pattern);

      // check mapping value

      // get data from pldb
      

      result.request_uri = requestUri;

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }
}
