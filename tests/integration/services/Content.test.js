/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import { expect } from 'chai';
import ContentService from '../../../src/services/Content';
import { DOMAINS, DOMAIN_VARIANTS } from '../../../src/configs/services/domains';
import operationKeys from '../../../src/configs/services/operation-keys';

describe('Content Service Test', () => {
  const service = new ContentService();

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('getDomain()', () => {
    it('gets domain mapping for promoBanners() operation', () => {
      expect(service.getDomain(operationKeys.GET_PROMO_BANNERS)).to.be.equal(DOMAIN_VARIANTS.APW);
    });

    it('gets domain mapping for forHome() operation', () => {
      expect(service.getDomain(operationKeys.GET_CONTENTS)).to.be.equal(DOMAINS.CARPARTS);
    });
  });

  it.skip('gets promotional banners (no data on staging)', (done) => {
    service.promoBanners().then((result) => {
      expect(result[0]).to.include.all.keys(['text', 'image', 'keyword', 'priority']);
      done();
    }).catch(done);
  });

  it('gets contents for home', (done) => {
    service.forHome().then((result) => {
      const resultKeys = ['featuredBrands', 'featuredMakes', 'featuredParts'];

      expect(result).to.include.all.keys(resultKeys);

      _.each(resultKeys, (key) => {
        expect(result[key], key).to.not.be.empty;
      });

      done();
    }).catch(done);
  });
});
