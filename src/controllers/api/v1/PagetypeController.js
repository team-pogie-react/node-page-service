import { _, merge } from 'lodash';
import converter from 'number-to-words';
import Promise from 'bluebird';
import { REQUEST_TIMEOUT } from 'http-status-codes';
import Content from '../../../services/Content';
import Pagetype from '../../../services/Pagetype';
import Seo from '../../../services/Seo';
import Config from '../../../configs/services/pages';
import ConfigPagetypes from '../../../configs/services/pagetypes';

import BaseController from '../BaseController';
import { isAlphaNumeric, consoler } from '../../../core/helpers';
import Videos from '../../../services/Videos';
import StructuredData from '../../../services/StructuredData';
import CacheInstance from '../../../core/Cache';

export default class PagetypeController extends BaseController {
  /**
   * Create controller instance.
   */

  constructor() {
    super();

    this.config = Config || {};
    this.seo = new Seo();
    this.contents = new Content();
    this.pagetype = new Pagetype();
    this.videos = new Videos();
    this.structuredData = new StructuredData();
    this.cache = CacheInstance;
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

      if (_.isEmpty(uri)) {
        return response.withError('Missing URI parameter', 400);
      }
      if (uri.charAt(0) === '/') {
        uri = uri.substr(1);
      }

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
      const redisCache = await this.cache.get(requestUri);
      consoler('redisCache', redisCache);
      if (redisCache) {
        result.results = redisCache;

        return response.withData(result);
      }

      // check if exist on redirector
      // we will use the `uri` variable so the / on the first
      let redirectorData = {};
      const rdrResults = {};
      redirectorData = await self._getRedirectorData(domain, requestUri);


      // TODO work with other statuses like redirect
      if (redirectorData && redirectorData.status === 'ACTIVE') {
        consoler('redirectorData', redirectorData);
        rdrResults.status_code = redirectorData.status_code;
        rdrResults.page_type = redirectorData.page_type;
        rdrResults.request_url = requestUri;
        rdrResults.attributes = redirectorData.attributes;
        rdrResults.site = domain;

        // return response.withData(rdrResults);
      } else if (redirectorData && redirectorData.status === 'REDIRECT') {
        rdrResults.status_code = redirectorData.status_code;
        rdrResults.redirect_url = redirectorData.redirect_url;
        rdrResults.request_url = requestUri;
        rdrResults.site = domain;
        rdrResults.append = 1;
      } else if (redirectorData && redirectorData.status === 'KILL') {
        rdrResults.status_code = redirectorData.status_code;
        rdrResults.redirect_url = redirectorData.redirect_url;
        rdrResults.request_url = requestUri;
        rdrResults.site = domain;
        rdrResults.append = 1;
      } else {
        // do nothing
      }

      // count the dimension
      const dimension = uri.split('/');

      // get pattern map base from number of dimension
      if (dimension[0] === 'details' || dimension[0] === 'univ') {
        dimension.splice(0, 1);
      }

      const dimensionCount = dimension.length;
      consoler('dimensionCount', dimensionCount);

      const patternList = self.config[`${converter.toWords(dimensionCount)}_dimension`];
      // check mapping value

      // get data from pldb
      const attributes = await this.pagetype.getAttributes(patternList, dimension);


      consoler('attributes', attributes);
      if (attributes && attributes.attributes && attributes.attributes.length > 0) {
        result.status_code = 200;
        result.site = domain;
        result.page_type = ConfigPagetypes[attributes.serialPattern];
        result.request_uri = requestUri;
        result.attributes = attributes.attributes;

        // get the pimcore data from catalog2
        let pimcoreData = {};
        pimcoreData = await self._getPimcoreData(domain, `/${domain}/${result.page_type}/${uri}`);
        if (pimcoreData && pimcoreData.data) {
          result.contents = pimcoreData.data;
        } else {
          // if no pimcore data try getting some from Content


        }
      } else {
        const error = {};
        error.message = 'Data Not Found';
        error.custom_code = 121;
        error.status_code = 404;
        result.error = error;

        return response.withData(result);
      }

      // check from catalog / unbxd if there's a product
      let catalogData = {};
      catalogData = await self._getCatalogData(domain, result.attributes);
      consoler('data catalogData', catalogData);
      if (catalogData) {
        result.products = catalogData;
      }

      return response.withData(result);
    } catch (error) {
      consoler('error', error);

      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * Aggregate service calls for REDIRECTOR page.
   *
   * @param {String} domain
   * @param {String} uri
   *
   * @return {Promise<Object>}
   */
  _getRedirectorData(domain, uri) {
    return new Promise((resolve, reject) => {
      this.pagetype.setDomain(domain).getRedirectorData(uri)
        .then(data => resolve(data))
        .catch((error) => {
          if (error.status === REQUEST_TIMEOUT) {
            return reject(error);
          }

          return resolve(error);
        });
    });
  }


  /**
   * Aggregate service calls for PIMCORE page.
   *
   * @param {String} domain
   * @param {String} uri
   *
   * @return {Promise<Object>}
   */
  _getPimcoreData(domain, uri) {
    return new Promise((resolve, reject) => {
      this.pagetype.setDomain(domain).getPimcoreData(uri)
        .then(data => resolve(data))
        .catch((error) => {
          if (error.status === REQUEST_TIMEOUT) {
            return reject(error);
          }

          return resolve(error);
        });
    });
  }

  /**
   * Aggregate service calls for PIMCORE page.
   *
   * @param {String} domain
   * @param {String} uri
   *
   * @return {Promise<Object>}
   */
  _getCatalogData(domain, uri) {
    return new Promise((resolve, reject) => {
      this.pagetype.setDomain(domain).getCatalogData(uri)
        .then(data => resolve(data))
        .catch((error) => {
          if (error.status === REQUEST_TIMEOUT) {
            return reject(error);
          }

          return resolve(error);
        });
    });
  }
}
