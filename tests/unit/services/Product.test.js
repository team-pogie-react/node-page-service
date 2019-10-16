/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import queryString from 'qs';
import { expect } from 'chai';
import sinon from 'sinon';
import ProductService from '../../../src/services/Products';
import { DOMAINS } from '../../../src/configs/services/domains';

describe('Product Service Test', () => {
  const service = new ProductService();
  const mocks = {};

  afterEach(() => {
    _.each(mocks, item => item.restore());
  });

  describe('search()', () => {
    const getLastParams = () => queryString.parse(mocks.http_get.getCall(0).lastArg.query);

    beforeEach(() => {
      service.setDomain(DOMAINS.CARPARTS);
      mocks.http_get = sinon.stub(service.http, 'get');

      mocks.http_get.resolves({ body: JSON.stringify({ results: 'something' }) });
    });

    describe('vehicle parameter override', () => {
      const mappings = {
        year: 'year',
        make: 'make_name',
        model: 'model_name',
        submodel: 'submodel_name',
        cylinders: 'cylinders',
        liter: 'liter',
      };

      _.each(mappings, (serviceEquivalent, param) => {
        it(`uses service equivalent mapping for vehicle parameter: "${param}"`, async () => {
          await service.search({
            vehicle: {
              [param]: 'something',
            },
          });

          expect(getLastParams()).to.have.property('vehicle');
          expect(getLastParams().vehicle).to.have.property(serviceEquivalent);
        });
      });
    });

    describe('filters parameter override', () => {
      const mappings = {
        toplevelcategory: 'tlc_name_list',
        category: 'cat_name_list',
        subcategory: 'scat_name_list',
        part: 'part_name',
        brand: 'brand_name',
        universal: 'isuniversal',
        price: 'price',
        position: 'position',
      };

      _.each(mappings, (serviceEquivalent, param) => {
        it(`uses service equivalent mapping for filters parameter: "${param}"`, async () => {
          await service.search({
            filters: {
              [param]: 'true',
            },
          });

          expect(getLastParams()).to.have.property(serviceEquivalent);
        });
      });
    });

    describe('attributes parameter', () => {
      it('accepts attributes query parameter and append it to an attribute search key', async () => {
        await service.search({
          attributes: {
            some_key: 'something',
            another_key: 'hehe',
          },
        });

        expect(getLastParams()).to.have.property('p_attr_some_key', 'something');
        expect(getLastParams()).to.have.property('p_attr_another_key', 'hehe');
      });
    });

    describe('sort parameters', () => {
      const mappings = {
        'best-match': '',
        'price-low': 'ASC',
        'price-high': 'DESC',
      };

      _.each(mappings, (serviceEquivalent, param) => {
        it(`uses service equivalent sort params: "${param}"`, async () => {
          await service.search({ sort: param });

          expect(getLastParams()).to.have.property('sort', serviceEquivalent);
        });
      });

      it('defaults to best-match sorting if sorting parameter is invalid', async () => {
        await service.search({ sort: 'randomize' });

        expect(getLastParams()).to.not.have.property('sort');
      });
    });

    describe('pagination parameters', () => {
      it('accepts current page parameter', async () => {
        await service.search({ currentpage: 1 });

        expect(getLastParams()).to.not.have.property('currentpage', 1);
      });

      it('accepts items per page parameter', async () => {
        await service.search({ itemperpage: 10 });

        expect(getLastParams()).to.not.have.property('itemsperpage', 10);
      });
    });
  });
});
