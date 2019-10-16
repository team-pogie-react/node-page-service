import Promise from 'bluebird';
import _ from 'lodash';
import BaseController from '../BaseController';
import Breadcrumb from '../../../services/Breadcrumb';
import Seo from '../../../services/Seo';
import Page from '../../../services/Page';
import Meta from '../../../services/Meta';
import Vehicle from '../../../services/Vehicle';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import Catalog from '../../../services/Catalog';
import UrlFormatter from '../../../core/library/seo/url/formatter';
import { compositeErrorHandler } from '../../../errors/handlers';
import BreadcrumbsConfig from '../../../configs/services/breadcrumbs';
import WidgetsConfig from '../../../configs/services/widgets';
import MetasConfig from '../../../configs/services/metas';
import Category from '../../../services/Category';
import { seoEncode } from '../../../core/helpers';


export default class DirectoryController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    this.prefix = 'directory_';
    this.breadcrumb = new Breadcrumb();
    this.seo = new Seo();
    this.page = new Page();
    this.vehicles = new Vehicle();
    this.widgets = new StrapiWidget();
    this.catalog = new Catalog();
    this.urlFormatter = new UrlFormatter();
    this.category = new Category();
    this.meta = new Meta();
    this.widgetsConfig = _.get(WidgetsConfig, 'DIRECTORY', {});
    this.metasConfig = _.get(MetasConfig, 'DIRECTORY', {});
    this.breadcrumbsConfig = _.get(BreadcrumbsConfig, 'DIRECTORY', {});
    this.options = {};

    this.make = '';
    this.model = '';
    this.brand = '';
    this.part = '';
    this.pageType = '';
    this.WidgetsKey = '';
    this.metasKey = '';
    this.breadcrumbsKey = '';
  }

  setPageType(pageType) {
    this.pageType = pageType;

    return this;
  }

  setWidgetsKey(pageType) {
    this.WidgetsKey = _.get(
      this.widgetsConfig,
      _.toUpper(pageType),
      '',
    );

    return this;
  }

  setMetasKey(pageType) {
    this.metasKey = _.get(this.metasConfig, _.toUpper(pageType), '');

    return this;
  }

  setBreadcrumbsKey(pageType) {
    this.breadcrumbsKey = _.get(this.breadcrumbsConfig, _.toUpper(pageType), '');

    return this;
  }

  getMake() {
    return this.make;
  }

  getModel() {
    return this.model;
  }

  getPageType() {
    return this.pageType;
  }

  getWidgetsKey() {
    return this.WidgetsKey;
  }

  getMetasKey() {
    return this.metasKey;
  }

  getBreadcrumbsKey() {
    return this.breadcrumbsKey;
  }

  /**
   * Get Makes & make/model
   *
   * @param {Object} request
   * @param {Object} response
   * @returns {Object} response
   */
  async makes(request, response) {
    const self = this;
    const pageType = 'make';


    self.setPageType(pageType);


    self.setWidgetsKey(self.getPageType());
    self.setMetasKey(self.getPageType());
    self.setBreadcrumbsKey(self.getPageType());

    self.options = {
      lookup: 'part',
      display_node: ['make'],
    };


    return self._getResponse(request, response);
  }

  /**
   * Get Brands.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async brands(request, response) {
    const self = this;
    const pageType = 'brand';
    self.setPageType(`${pageType}`);
    self.options = {
      page_type: `${pageType}`,
      lookup: `${pageType}`,
      filter: {},
      display_node: [`${pageType}`],
    };

    self.setWidgetsKey(self.getPageType());
    self.setMetasKey(self.getPageType());
    self.setBreadcrumbsKey(self.getPageType());

    return self._getResponse(request, response);
  }

  /**
   * Get Parts.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object} response
   */
  async parts(request, response) {
    const self = this;
    self.setPageType('part');
    self.options = {
      page_type: 'part',
      lookup: 'part',
      filter: {},
      display_node: ['part'],
    };

    self.setWidgetsKey(self.getPageType());
    self.setMetasKey(self.getPageType());
    self.setBreadcrumbsKey(self.getPageType());

    return self._getResponse(request, response);
  }

  /**
   * Aggregate service calls for Directory page.
   *
   * @param {String} domain
   *
   * @return {Array}
   */
  async _aggregated(domain) {
    const self = this;
    const breadcrumb = self.breadcrumb.setDomain(domain);
    const catalog = self.catalog.setDomain(domain);
    const meta = self.meta.setDomain(domain);
    const vehicles = self.vehicles.setDomain(domain);
    const widgets = self.widgets.setDomain(domain);
    const category = this.category.setDomain(domain);

    const requestDataAttribute = {};

    _.set(requestDataAttribute, 'make', self.getMake());
    _.set(requestDataAttribute, 'model', self.getModel());

    return [
      widgets.getByPage(self.getWidgetsKey()).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler).catch(compositeErrorHandler),
      catalog.getBrandPart({}, self.options, self._transformListing).catch(compositeErrorHandler),
      meta.getByPage(self.getMetasKey(), requestDataAttribute).catch(compositeErrorHandler),
      breadcrumb.getByPage(self.getBreadcrumbsKey(), requestDataAttribute)
        .catch(compositeErrorHandler),
      category.get().catch(compositeErrorHandler),
    ];
  }

  /**
   * Get Response form calls for Directory page.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @return {Array}
   */
  async _getResponse(request, response) {
    const self = this;

    try {
      const domain = this.getDomain(request);
      const result = await Promise.all(self._aggregated(domain))
        .then(([
          widgets,
          years,
          listingResponse,
          metaResponse,
          breadcrumbsResponse,
          navigationCategories,
        ]) => Promise.resolve({
          breadcrumbs: breadcrumbsResponse,
          listing: listingResponse,
          meta: metaResponse,
          navigationCategories,
          pageType: `${self.prefix}${self.getPageType()}`,
          widgets,
          years,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status);
    }
  }

  /**
   * Format listing node in Directory page.
   *
   * @param {Object} collection
   *
   * @return {Array}
   */
  _transformListing(collection) {
    const { data } = collection;
    const listing = [];

    _.each(data, (obj) => {
      const nodeName = _(obj).keys().pop();

      listing.push({
        text: _.get(obj, nodeName, ''),
        link: `/${seoEncode(obj[nodeName])}`,
      });
    });

    return listing;
  }
}
