import { merge, get } from 'lodash';
import { compositeErrorHandler } from '../../../../errors/handlers';
import BaseController from '../../BaseController';
import Seo from '../../../../services/Seo';
import Category from '../../../../services/Category';
import Vehicle from '../../../../services/Vehicle';
import StrapiWidget from '../../../../services/widgets/StrapiWidget';
import BreadCrumb from '../../../../services/Breadcrumb';
import Meta from '../../../../services/Meta';
import Videos from '../../../../services/Videos';
import Headings from '../../../../services/Headings';
import StructuredData from '../../../../services/StructuredData';
import BreadcrumbConfig from '../../../../configs/services/breadcrumbs';
import Metas from '../../../../configs/services/metas';
import Widgets from '../../../../configs/services/widgets';
import VideosConfig from '../../../../configs/services/videos';

export default class MakeController extends BaseController {
  /** @inheritdoc */
  constructor() {
    super();
    this.vehicles = new Vehicle();
    this.categories = new Category();
    this.widgets = new StrapiWidget();
    this.breadCrumb = new BreadCrumb();
    this.meta = new Meta();
    this.videos = new Videos();
    this.headings = new Headings();
    this.seo = new Seo();
    this.structuredData = new StructuredData();
    this.headings = new Headings();
  }

  /**
   * Get models for specific makes.
   *
   * @param {Object} request
   * @param {String} domain
   * @param {String} page
   *
   * @returns {Object<Promise>}
   */
  async index(request, domain, page) {
    const result = await Promise.all(
      this._aggregatedCall(domain, page),
    )
      .then(([
        years,
        navigationCategories,
        topParts,
        shopByModels,
        widgets,
        breadcrumbs,
        meta,
        videos,
        headers,
      ]) => Promise.resolve({
        articles: page.articles,
        breadcrumbs,
        header: get(headers, 'page', null),
        headings: {
          articles: this.headings.articles(page.articles.header),
          shopByModels: this.headings.shopByModels(page.attributes.make.make_name),
          topParts: this.headings.topParts(get(headers, 'page', null)),
          videos: VideosConfig.heading,
        },
        meta,
        navigationCategories,
        topParts,
        shopByModels,
        videos,
        widgets,
        years,
        structuredData: this.structuredData.setDomain(domain).generate({
          BreadcrumbList: breadcrumbs,
        }),
      }));

    return result;
  }

  /**
   * Aggregate service calls for make page.
   *
   * @param {String} domain
   * @param {Object} page
   *
   * @return {Array}
   */
  _aggregatedCall(domain, page) {
    const attributes = get(page, 'attributes');
    const pageType = get(page, 'page_type');
    const vehicles = this.vehicles.setDomain(domain);
    const widgets = this.widgets.setDomain(domain);
    const breadCrumb = this.breadCrumb.setDomain(domain);
    const meta = this.meta.setDomain(domain);
    const categories = this.categories.setDomain(domain);
    const seo = this.seo.setDomain(domain);
    const headings = this.headings.setDomain(domain);
    const { videos } = this;
    const pageAttributes = merge({}, attributes);
    pageAttributes.make.make_name = encodeURIComponent(pageAttributes.make.make_name);

    const requestDataAttribute = {
      make: attributes.make.make_name,
    };

    return [
      vehicles.years().catch(compositeErrorHandler),
      categories.get().catch(compositeErrorHandler),
      seo.getTop40Parts(pageAttributes).catch(compositeErrorHandler),
      seo.getBrandPart(pageAttributes).catch(compositeErrorHandler),
      widgets.getByPage(Widgets.SEO_MAKE).catch(compositeErrorHandler),
      breadCrumb.getByPage(BreadcrumbConfig.MAKE, requestDataAttribute)
        .catch(compositeErrorHandler),
      meta.getByPage(Metas.MAKE, requestDataAttribute).catch(compositeErrorHandler),
      videos.getCommon().catch(compositeErrorHandler),
      headings.getPageHeader(pageType, requestDataAttribute).catch(compositeErrorHandler),
    ];
  }
}
