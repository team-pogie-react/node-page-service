/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import { expect } from 'chai';
import { DOMAINS } from '../../../src/configs/services/domains';
import operationKeys from '../../../src/configs/services/operation-keys';
import ApiService from '../../../src/services/ApiService';
import { MissingDomainError } from '../../../src/errors';

describe('ApiService Test', () => {
  const apiService = new ApiService();

  describe('setDomain()', () => {
    it('sets domain', () => {
      apiService.setDomain('somedomain.com');

      expect(apiService.getDomain()).to.be.equal('somedomain.com');
    });
  });

  describe('getDomain()', () => {
    it('throws a MissingDomainError when domain is not set', () => {
      const fn = () => (new ApiService()).getDomain();

      expect(fn).to.throw(MissingDomainError, /set/);
    });

    it('throws a MissingDomainError when operation is not mapped to a domain', () => {
      const fn = () => {
        apiService.setDomain('somedomain.com');
        apiService.getDomain('some-unmapped-operation');
      };

      expect(fn).to.throw(MissingDomainError, /Missing somedomain.com mapping for the operation/);
    });
  });
});
