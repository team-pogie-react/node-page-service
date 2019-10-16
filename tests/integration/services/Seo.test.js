/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import chai, { expect } from 'chai';
import SeoService from '../../../src/services/Seo';
import operationKeys from '../../../src/configs/services/operation-keys';
import { DOMAINS, DOMAIN_VARIANTS } from '../../../src/configs/services/domains';

chai.should();

describe('Seo Service Test', () => {
  const service = new SeoService();
  const attribute = {
    model: {
      model: '5000-quattro',
      model_name: '5000+Quattro',
    },
    make: {
      make: 'audi',
      make_name: 'Audi',
    },
    part: {
      part: 'water-pump',
      part_name: 'Water+Pump',
    },
    year: {
      year: '1987',
    },
  };
  const nrParams = [
    'make:Audi',
    'model:5000+Quattro',
    'part:Water+Pump',
    'year:1987',
  ];
  const yearMakeModelParts = '/water-pump/audi/5000-quattro/1987';

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('getDomain()', () => {
    it('gets domain mapping for top[Brands|Parts|Makes]() operation', () => {
      expect(service.getDomain(operationKeys.GET_TOP_SEO))
        .to.be.equal(DOMAIN_VARIANTS.WWW_CARPARTS);
    });
  });

  it('gets top brands from hydra with limit', (done) => {
    const limit = 1;
    service.topBrands(limit).then((result) => {
      expect(_.size(result)).to.be.equal(limit);

      done();
    }).catch(done);
  });

  it('gets top parts from hydra with limit', (done) => {
    const limit = 10;
    service.topParts(limit, attribute).then((result) => {
      expect(_.size(result)).to.be.equal(limit);

      done();
    }).catch(done);
  });

  it('gets top 40 parts', (done) => {
    const itemCount = 40;
    service.getTop40Parts(attribute).then((result) => {
      expect(_.size(result)).to.be.equal(itemCount);

      done();
    }).catch(done);
  });

  it('gets list of SEO Years', (done) => {
    service.getSeoYear(attribute).then((result) => {
      expect(Array.isArray(result)).to.be.equal(true);

      done();
    }).catch(done);
  });

  it('gets Brand Parts', (done) => {
    service.getBrandPart(attribute).then((result) => {
      const expectedKeys = [
        'text',
        'image',
        'link',
      ];
      expect(Array.isArray(result)).to.be.equal(true);

      _.each(result, (item) => {
        item.should.include.all.keys(expectedKeys);
      });

      done();
    }).catch(done);
  });

  it('gets Search API Result', (done) => {
    service.search(attribute, nrParams).then((result) => {
      const expectedKeys = [
        'selected',
        'available',
      ];

      result.should.include.all.keys(expectedKeys);

      done();
    }).catch(done);
  });
});
