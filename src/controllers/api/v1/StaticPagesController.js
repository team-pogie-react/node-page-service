import BaseController from '../BaseController';
import Meta from '../../../services/Meta';
import StrapiWidget from '../../../services/widgets/StrapiWidget';
import StaticPages from '../../../services/StaticPagesService';
import { compositeErrorHandler } from '../../../errors/handlers';
import Category from '../../../services/Category';
import Vehicle from '../../../services/Vehicle';

export default class StaticPagesController extends BaseController {
  /**
   * Create Static instance.
   */
  constructor() {
    super();

    this.metas = new Meta();
    this.widgets = new StrapiWidget();
    this.categories = new Category();
    this.staticPages = new StaticPages();
    this.vehicles = new Vehicle();
  }

  /**
   * Display Static Content
   * @param request
   * @param response
   * @returns {Promise<*>}
   */
  async index(request, response) {
    try {
      const domain = this.getDomain(request);
      const result = await Promise.all(this._aggregatedStaticPages(domain, request.query))
        .then(([
          meta,
          widgets,
          contents,
          years,
          navigationCategories,
          { pageType },
        ]) => Promise.resolve({
          meta,
          widgets,
          contents,
          years,
          navigationCategories,
          pageType,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  async forms(request, response) {
    try {
      const domain = this.getDomain(request);
      const { type } = request.params;
      const query = {
        type,
        post: request.body,
      };
      const result = await Promise.all(this._aggregatedStaticForms(domain, query, request))
        .then(([
          form,
        ]) => Promise.resolve({
          form,
        }));

      return response.withData(result);
    } catch (error) {
      return response.withError(error.message, error.status, error.code);
    }
  }

  _aggregatedStaticForms(domain, query, request) {
    const staticPages = this.staticPages.setDomain(domain);
    const formSendPromise = staticPages.sendForm(query, domain, request);

    return [
      formSendPromise.catch(compositeErrorHandler),
    ];
  }

  _aggregatedStaticPages(domain, query) {
    const meta = this.metas.setDomain(domain);
    const staticPages = this.staticPages.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const categories = this.categories.setDomain(domain);
    const vehicles = this.vehicles.setDomain(domain);
    const uriPromise = staticPages.parseUri(query.uri);

    const widgetPromise = uriPromise.then(parsed => widgets.getByPage(parsed.pageType));
    const metaPromise = uriPromise.then(parsed => meta.getByPage(parsed.metaType));
    const slugContentPromise = uriPromise.then(parsed => staticPages.getStaticPage(parsed.slug));

    return [
      metaPromise.catch(compositeErrorHandler),
      widgetPromise.catch(compositeErrorHandler),
      slugContentPromise.catch(compositeErrorHandler),
      vehicles.years().catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      uriPromise.catch(compositeErrorHandler),
    ];
  }
}
