/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import ProductService from '../../../src/services/Products';
import operationKeys from '../../../src/configs/services/operation-keys';
import { DOMAINS } from '../../../src/configs/services/domains';

describe('Product Service Test', () => {
  const service = new ProductService();

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('getDomain()', () => {
    it('gets domain mapping for get() operation', () => {
      expect(service.getDomain(operationKeys.GET_PRODUCTS))
        .to.be.equal(DOMAINS.CARPARTS);
    });
  });

  describe('search()', () => {
    it('returns 404 ApiError for non-existent sku', async () => {
      let error;
      const params = {
        q: 'GM24ERF',
      };

      try {
        await service.search(params);
      } catch (e) {
        error = e;
      }

      expect(error).to.not.be.null;
      expect(error.status).to.be.equal(404);
      expect(error.code).to.be.equal(121);
    });

    it('searches for products with space', (done) => {
      const limit = 1;
      const params = {
        q: 'Oxygen Sensor',
        itemperpage: limit,
      };

      service.search(params).then((result) => {
        expect(result).to.have.property('items').that.has.length.at.least(limit);
        expect(result.items[0].description).to.contain('OXYGEN SENSOR');

        done();
      }).catch(done);
    });

    it('searches for products with special character', (done) => {
      const limit = 1;
      const params = {
        q: '2000 Chrysler Town & Country Mirror',
        itemperpage: limit,
      };

      service.search(params).then((result) => {
        expect(result).to.have.property('items').that.has.length.at.least(limit);
        expect(result.items[0].description).to.contain('mirror');

        done();
      }).catch(done);
    });

    it('gets products without "q" parameter', (done) => {
      service.search({ itemperpage: 1 }).then((result) => {
        expect(result).to.have.property('items').that.has.length.at.least(1);

        done();
      }).catch(done);
    });
  });

  describe('details()', () => {
    const sku = 'LLORT001';

    it('gets a product with vendor node', (done) => {
      service.details({ sku }).then((result) => {
        expect(result).to.have.property('id');
        expect(result).to.have.property('vendor');
        expect(result.isVendor).to.be.true;

        done();
      });
    });

    it('does not use rtpi prices when rtpi returns 0', (done) => {
      service.details({ sku: 'EVA162060816119' }).then((result) => {
        const { pricing } = result;

        expect(pricing.saveAmount).to.not.be.equal('0.00');
        expect(pricing.savePercent).to.not.be.equal('0.00');
        expect(pricing.regularPrice).to.not.be.equal('0.00');
        done();
      }).catch(done);
    });
  });
});
