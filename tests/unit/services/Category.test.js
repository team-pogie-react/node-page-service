/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import _ from 'lodash';
import { expect } from 'chai';
import sinon from 'sinon';
import { withError, withEmptyPayload, withEmptyResult } from '../../stubs/hydra_responses.json';
import CategoryService from '../../../src/services/Category';
import { DOMAINS } from '../../../src/configs/services/domains';

describe('Category Service Test', () => {
  const service = new CategoryService();
  const mocks = {};

  afterEach(() => {
    _.each(mocks, item => item.restore());
  });

  describe('get()', () => {
    beforeEach(() => {
      service.setDomain(DOMAINS.CARPARTS);
      mocks.http_get = sinon.stub(service.http, 'get');
    });

    it('rejects with ApiError if hydra call encountered an error', async () => {
      let error;

      mocks.http_get.resolves({ body: JSON.stringify(withError) });

      try {
        await service.get();
      } catch (e) {
        error = e;
      }

      expect(error.name).to.be.equal('ApiError');
      expect(error.code).to.be.equal(withError._callstatus.error_code);
      expect(error.message).to.be.equal(withError._callstatus.error_message);
    });

    it('rejects with NoResultError if hydra call payload is empty', async () => {
      let error;

      mocks.http_get.resolves({ body: JSON.stringify(withEmptyPayload) });

      try {
        await service.get();
      } catch (e) {
        error = e;
      }

      expect(error.name).to.be.equal('ApiError');
      expect(error.code).to.be.equal(500);
      expect(error.message).to.contain('Payload is empty');
    });

    it('rejects with InvalidParameterError if hydra call payload returns SUCC5001', async () => {
      let error;

      mocks.http_get.resolves({ body: JSON.stringify(withEmptyResult) });

      try {
        await service.get();
      } catch (e) {
        error = e;
      }

      expect(error.name).to.be.equal('InvalidParameterError');
      expect(error.status).to.be.equal(422);
      expect(error.code).to.be.equal('SUCC5001');
      expect(error.message).to.contain('Invalid parameter.');
    });
  });
});
