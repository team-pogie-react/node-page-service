import { _, merge } from 'lodash';

import Content from '../../../services/Content';
import Page from '../../../services/Page';
import Seo from '../../../services/Seo';
import Config from '../../../configs/services/pages';

import BaseController from '../BaseController';

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
      const uri = _.get(request, 'query.uri', '');
      const tid = _.get(request, 'query.TID', _.get(request, 'query.tid'));

      if (_.isEmpty(uri)) {
        return response.withError('Missing URI parameter', 400);
      }

      let page = {};
      let result = {};

      //check the validity of uri

      //count the dimension

      //get pattern map base from number of dimension

      //check mapping value

      //get data from pldb

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

}
