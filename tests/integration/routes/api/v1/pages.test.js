/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import '../../../hooks/routeAfterHook';
import app from '../../../../fixtures/app';
import { DOMAINS } from '../../../../../src/configs/services/domains';

describe('Pages Routes', () => {
  const part = '/bumper';
  const make = '/audi';
  const brand = '/replacement';
  const brandPart = '/replacement/bumper';
  const makePart = '/bumper/honda';
  const makeModel = '/audi/5000-quattro';
  const makeModelPart = '/brake-caliper/acura/cl';
  const yearMakeModelPart = '/water-pump/audi/5000-quattro/1987';
  const pagesEndpoint = '/v1/pages';

  it('returns aggregated response for home', (done) => {
    app.get('/v1/home')
      .query({ domain: DOMAINS.CARPARTS })
      .then((response) => {
        const expectedKeys = [
          'widgets',
          'shopByCategories',
          'shopByTopBrands',
          'shopByPopularParts',      
          'featuredMakes',    
          'years',
          'navigationCategories',
        ];

        response.should.have.status(200);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);

        _.each(expectedKeys, (key) => {
          response.body.data[key].should.not.be.empty;
        });

        done();
      }).catch(done);
  });

  it('returns aggregated response for make model page', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: makeModel })
      .then((response) => {
        const expectedKeys = [
          'articles',
          'breadcrumbs',
          'meta',
          'navigationCategories',
          'products',
          'topParts',          
          'widgets',
          'years',                    
          'header',          
          'pageType',
        ];
        
        response.should.not.have.status(500);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        
        response.body.data.articles.should.be.an('object');
        response.body.data.breadcrumbs.should.be.an('array');
        response.body.data.meta.should.be.an('object');
        response.body.data.navigationCategories.should.be.an('array');
        response.body.data.products.should.be.an('object');
        response.body.data.topParts.should.be.an('array');        
        response.body.data.widgets.should.be.an('array');
        response.body.data.years.should.be.an('array');
        response.body.data.header.should.be.an('string');
        response.body.data.pageType.should.be.an('string');

        done();
      }).catch(done);
  });

  it('returns aggregated response for make model part page', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: makeModelPart })
      .then((response) => {
        const expectedKeys = [
          'articles',
          'breadcrumbs',
          'meta',
          'navigationCategories',
          'products',
          'shopByYears',
          'widgets',
          'years',
          'header',
          'pageType',
        ];

        response.should.not.have.status(500);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.articles.should.be.an('object');
        response.body.data.breadcrumbs.should.be.an('array');
        response.body.data.meta.should.be.an('object');
        response.body.data.navigationCategories.should.be.an('array');
        response.body.data.products.should.be.an('object');
        response.body.data.shopByYears.should.be.an('array');        
        response.body.data.widgets.should.be.an('array');
        response.body.data.years.should.be.an('array');
        response.body.data.header.should.be.an('string');
        response.body.data.pageType.should.be.an('string');

        done();
      }).catch(done);
  });

  it('returns aggregated response for year make model part page', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: yearMakeModelPart })
      .then((response) => {
        const expectedKeys = [
          'widgets',
          'years',
          'breadcrumbs',
          'products',
          'articles',
          'pageType',
        ];

        response.should.not.have.status(500);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);

        done();
      }).catch(done);
  });

  it('returns aggregated response for make page', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: make })
      .then((response) => {
        const expectedKeys = [
          'articles',
          'breadcrumbs',
          'meta',
          'navigationCategories',
          'topParts',
          'shopByModels',
          'widgets',
          'years',                    
          'header',          
          'pageType',
        ];

        response.should.not.have.status(500);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.articles.should.be.an('object');
        response.body.data.breadcrumbs.should.be.an('array');
        response.body.data.meta.should.be.an('object');
        response.body.data.navigationCategories.should.be.an('array');
        response.body.data.topParts.should.be.an('array');
        response.body.data.shopByModels.should.be.an('array');
        response.body.data.widgets.should.be.an('array');
        response.body.data.years.should.be.an('array');
        response.body.data.header.should.be.an('string');
        response.body.data.pageType.should.be.an('string');

        done();
      }).catch(done);
  });

  it('returns aggregated response for part page', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: part })
      .then((response) => {
        const expectedKeys = [
          'pageType',
          'meta',
          'breadcrumbs',
          'years',
          'articles',
          'shopByBrands',
          'shopByMakes',
          'products',
          'widgets',
        ];

        response.should.not.have.status(500);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);

        done();
      }).catch(done);
  });


  it('returns aggregated response for Brand Pages.', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: brand })
      .then((response) => {
        const expectedKeys = [
          'articles',
          'breadcrumbs',
          'meta',
          'navigationCategories',
          'pageType',
          'products',
          'shopByParts',
          'widgets',
          'years',
          'header',
        ];

        response.should.not.have.status(500);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);

        done();
      }).catch(done);
  });


  it('returns aggregated response for Brand Part Pages.', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: brandPart })
      .then((response) => {
        const expectedKeys = [
          'articles',
          'breadcrumbs',
          'meta',
          'navigationCategories',
          'pageType',
          'products',
          'shopByBrands',
          'widgets',
          'years',
          'header',
        ];

        
        response.should.not.have.status(500);
        
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);
        response.body.data.articles.should.be.an('object');
        response.body.data.breadcrumbs.should.be.an('array');
        response.body.data.meta.should.be.an('object');
        response.body.data.navigationCategories.should.be.an('array');
        response.body.data.pageType.should.be.an('string');
        response.body.data.products.should.be.an('object');
        response.body.data.shopByBrands.should.be.an('array');
        response.body.data.widgets.should.be.an('array');
        response.body.data.years.should.be.an('array');
        response.body.data.header.should.be.an('string');
        

        done();
      }).catch(done);
  });

  it('returns aggregated response for Make Part Pages', (done) => {
    app.get(pagesEndpoint)
      .query({ domain: DOMAINS.CARPARTS, uri: makePart })
      .then((response) => {
        const expectedKeys = [
          'articles',
          'meta',
          'breadcrumbs',
          'navigationCategories',
          'products',
          'shopByModels',
          'widgets',
          'years',
          'header',
          'pageType',
        ];

        response.should.not.have.status(500);
        response.body.should.be.an('object');
        response.body.should.have.property('data');
        response.body.data.should.include.all.keys(expectedKeys);

        response.body.data.articles.should.be.an('object');
        response.body.data.meta.should.be.an('object');
        response.body.data.breadcrumbs.should.be.an('array');        
        response.body.data.navigationCategories.should.be.an('array');
        response.body.data.products.should.be.an('object');
        response.body.data.shopByModels.should.be.an('array');
        response.body.data.widgets.should.be.an('array');
        response.body.data.years.should.be.an('array');
        response.body.data.header.should.be.an('string');
        response.body.data.pageType.should.be.an('string');
        
        done();
      }).catch(done);
  });
});
