import _ from 'lodash';
import BaseController from '../BaseController';


export default class PageredirectController extends BaseController {
  /**
   * Create controller instance.
   */
  index(request, response) {
    return {
      pageType: 'page_redirect',
      redirectUri: _.get(response, 'page.redirect_url', 301),
      requestUri: _.get(response, 'page.request_url', ''),
      statusCode: _.get(response, 'page.status_code', ''),
      append: _.get(response, 'page.append', ''),
    };
  }
}
