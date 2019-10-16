/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import BaseController from '../../../../src/controllers/api/BaseController';

describe('BaseController Test', () => {
  const controller = new BaseController();

  describe('getDomain()', () => {
    const domain = 'domain.com';

    it('gets domain from request body', () => {
      expect(controller.getDomain({ body: { domain } })).to.be.equal(domain);
    });

    it('gets domain from request query', () => {
      expect(controller.getDomain({ query: { domain } })).to.be.equal(domain);
    });

    it('returns an empty string if domain is not in request body or query', () => {
      expect(controller.getDomain({ somestub: { domain } })).to.be.equal('');
    });
  });
});
