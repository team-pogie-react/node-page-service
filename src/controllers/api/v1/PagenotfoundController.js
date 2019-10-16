import Promise from 'bluebird';
import BaseController from '../BaseController';
import Meta from '../../../services/Meta';
import Vehicle from '../../../services/Vehicle';
import Category from '../../../services/Category';
import Breadcrumb from '../../../services/Breadcrumb';
import { compositeErrorHandler } from '../../../errors/handlers';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import {
  widgets as WIDGETS,
  metas as METAS,
  breadcrumbs as BREADCRUMBS,
} from '../../../configs/services';


export default class PagenotfoundController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    const self = this;
    self.categories = new Category();
    self.vehicles = new Vehicle();
    self.widgets = new StrapiWidget();
    self.breadcrumbs = new Breadcrumb();
    self.metas = new Meta();
  }

  index(request, response) {
    const self = this;

    return self._getResponse(request, response);
  }


  /**
   * _tasks
   *
   * @param {String} domain
   *
   * @return {Array}
   */
  _tasks(domain) {
    const self = this;
    const metas = self.metas.setDomain(domain);
    const breadcrumbs = self.breadcrumbs.setDomain(domain);
    const vehicles = self.vehicles.setDomain(domain);
    const widgets = self.widgets.setDomain(domain);
    const categories = self.categories.setDomain(domain);

    return [
      metas.getByPage(METAS.PAGE_NOT_FOUND).catch(compositeErrorHandler),
      breadcrumbs.getByPage(BREADCRUMBS.PAGE_NOT_FOUND).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.PAGE_NOT_FOUND).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
    ];
  }


  /**
   *
   * @param {Object} request
   *
   * @return {Array}
   */
  async _getResponse(request) {
    const self = this;
    const domain = self.getDomain(request);
    const result = await Promise.all(self._tasks(domain))
      .then(([
        meta,
        breadcrumbs,
        widgets,
        years,
        navigationCategories,
      ]) => Promise.resolve({
        meta,
        breadcrumbs,
        widgets,
        years,
        navigationCategories,
        pageType: 'page_notfound',
      }));

    return result;
  }
}
