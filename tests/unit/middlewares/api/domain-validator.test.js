/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chai, { expect } from 'chai';
import domainValidatorMiddleware from '../../../../src/middlewares/api/domain-validator';
import { DOMAINS } from '../../../../src/configs/services/domains';

chai.use(sinonChai);

describe('Domain Validator  Middleware Test', () => {
  const response = { withError: sinon.stub() };
  const nextStub = sinon.stub();
  const request = { body: {}, query: {} };

  afterEach(() => {
    response.withError.reset();
    nextStub.reset();
  });

  it('responds with error when domain is not in request query or body', () => {
    domainValidatorMiddleware(request, response, nextStub);

    expect(response.withError).to.be.calledOnce;
    expect(response.withError.lastCall.lastArg).to.be.equal(400);
    expect(nextStub).to.not.be.called;
  });

  it('responds with error when domain is not valid', () => {
    request.query = { domain: 'invalid.com' };
    domainValidatorMiddleware(request, response, nextStub);

    expect(response.withError).to.be.calledOnce;
    expect(response.withError.lastCall.lastArg).to.be.equal(400);
    expect(nextStub).to.not.be.called;
  });

  it('calls next when the domain is present and valid', () => {
    request.query = { domain: DOMAINS.CARPARTS };
    domainValidatorMiddleware(request, response, nextStub);

    expect(nextStub).to.be.calledOnce;
    expect(response.withError).to.not.be.called;
  });
});
