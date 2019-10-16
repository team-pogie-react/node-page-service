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


export default class NomatchController extends BaseController {
  /**
   * Create controller instance.
   */
  constructor() {
    super();

    this.categories = new Category();
    this.breadcrumb = new Breadcrumb();
    this.vehicles = new Vehicle();
    this.metas = new Meta();
    this.widgets = new StrapiWidget();
  }

  async index(request, response) {
    try {
      const domain = this.getDomain(request);
      const result = await Promise.all(this._aggregatedNomatch(domain, request)).then(([
        meta,
        widgets,
        navigationCategories,
        breadcrumbs,
        years,
      ]) => Promise.resolve({
        meta,
        widgets,
        navigationCategories,
        breadcrumbs,
        years,
        pageType: 'nomatch',
      }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  /**
   * _aggregatedNomatch
   *
   * @param {String} domain
   *
   * @return {Array}
   */

  _aggregatedNomatch(domain, request) {
    const { query } = request;
    const metas = this.metas.setDomain(domain);
    const categories = this.categories.setDomain(domain);
    const breadcrumb = this.breadcrumb.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);

    return [
      metas.getByPage(METAS.NO_MATCH, query).catch(compositeErrorHandler),
      widgets.getByPage(WIDGETS.NO_MATCH).catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      breadcrumb.getByPage(BREADCRUMBS.NO_MATCH).catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
    ];
  }
}
