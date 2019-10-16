/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import { expect } from 'chai';
import CategoryService from '../../../src/services/Category';
import operationKeys from '../../../src/configs/services/operation-keys';
import { DOMAINS } from '../../../src/configs/services/domains';

describe('Category Service Test', () => {
  const service = new CategoryService();

  before(() => {
    service.setDomain(DOMAINS.CARPARTS);
  });

  describe('getDomain()', () => {
    it('gets domain mapping for get() operation', () => {
      expect(service.getDomain(operationKeys.GET_CATEGORIES)).to.be.equal(DOMAINS.CARPARTS);
    });
  });

  it('gets categories from hydra', (done) => {
    service.get().then((result) => {
      expect(_.size(result)).to.be.equal(8);
      expect(result[0]).to.include.all.keys(['text', 'link']);
      expect(result[0]).to.have.property('categories').that.is.an('array');
      expect(result[0].categories[0]).to.have.property('image');
      expect(result[0].categories[0]).to.not.have.property('subcategories');

      done();
    }).catch(done);
  });
});
