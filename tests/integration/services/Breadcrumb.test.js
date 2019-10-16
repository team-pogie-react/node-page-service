/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import BreadcrumbService from '../../../src/services/Breadcrumb';
import { DOMAINS } from '../../../src/configs/services/domains';
import crumbs from '../../../src/configs/services/breadcrumbs';

chai.use(chaiSubset);

describe('Breadcrumbs Test', () => {
  const service = new BreadcrumbService();

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('#getByPage()', () => {
    it('gets breadcrumbs for home', (done) => {
      service.getByPage(crumbs.HOME).then((result) => {
        expect(result).to.have.lengthOf(1);
        expect(result[0]).to.have.property('value', '/');
        done();
      }).catch(done);
    });

    it('gets breadcrubms by page type "brand_part" with part and brand', (done) => {
      service.getByPage(crumbs.BRAND_PART, {
        part: 'Mirror',
        brand: 'Hastings',
      }).then((result) => {
        expect(result).to.have.lengthOf(3);
        expect(result).to.containSubset([{ text: 'Mirror' }]);
        expect(result).to.containSubset([{ text: 'Hastings' }]);
        done();
      }).catch(done);
    });

    describe('errors', () => {
      it('handles http errors', async () => {
        try {
          await service.getByPage(undefined, {});
        } catch (error) {
          expect(error.message).to.contain('Not Found');
          expect(error.code).to.be.equal(404);
          expect(error.status).to.be.equal(404);
        }
      });
    });
  });
});
