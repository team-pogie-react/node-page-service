/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import * as errors from '../../../src/errors';
import {
  makeError,
  makeJsonError,
  makesJsonApiError,
  makeHttpClientError,
} from '../../../src/errors/make';

describe('Error factory helper test', () => {
  describe('makeError()', () => {
    it('defaults to NoResultError if code provided is unknown', () => {
      expect(makeError('some-error-code')).to.be.instanceOf(errors.NoResultError);
    });

    it('creates error for SUCC403', () => {
      expect(makeError('SUCC403')).to.be.instanceOf(errors.ResourceNotAvailableError);
    });

    it('creates error for SUCC404', () => {
      expect(makeError('SUCC404')).to.be.instanceOf(errors.ResourceNotFoundError);
    });

    it('creates error for SUCC408', () => {
      expect(makeError('SUCC408')).to.be.instanceOf(errors.ServiceDependencyTimeoutError);
    });

    it('creates error for SUCC501', () => {
      expect(makeError('SUCC501')).to.be.instanceOf(errors.UnknownServiceError);
    });

    it('creates error for SUCC503', () => {
      expect(makeError('SUCC503')).to.be.instanceOf(errors.ServiceDownError);
    });

    it('creates error for SUCC5000', () => {
      expect(makeError('SUCC5000')).to.be.instanceOf(errors.FailedOperationError);
    });

    it('creates error for SUCC5001', () => {
      expect(makeError('SUCC5001')).to.be.instanceOf(errors.InvalidParameterError);
    });

    it('creates error for SUCC6000', () => {
      expect(makeError('SUCC6000')).to.be.instanceOf(errors.NoResultError);
    });

    it('creates error for SUCC6001', () => {
      expect(makeError('SUCC6001')).to.be.instanceOf(errors.ExistingDataError);
    });

    it('creates error for SUCC5002', () => {
      expect(makeError('SUCC5002')).to.be.instanceOf(errors.InvalidEmailError);
    });

    it('creates error for SUCC5003', () => {
      expect(makeError('SUCC5003')).to.be.instanceOf(errors.InvalidZipCodeError);
    });

    it('creates error for SUCC5004', () => {
      expect(makeError('SUCC5004')).to.be.instanceOf(errors.InvalidPhoneNumberError);
    });

    it('creates error for SUCC5005', () => {
      expect(makeError('SUCC5005')).to.be.instanceOf(errors.InvalidCreditCardError);
    });

    it('creates error for SUCC5006', () => {
      expect(makeError('SUCC5006')).to.be.instanceOf(TypeError);
    });

    it('creates error for SUCC5007', () => {
      expect(makeError('SUCC5007')).to.be.instanceOf(errors.InvalidDateFormatError);
    });

    it('creates error for SUCC5008', () => {
      expect(makeError('SUCC5008')).to.be.instanceOf(errors.InvalidTokenError);
    });
  });

  describe('makeJsonError()', () => {
    const error = {
      message: 'a message',
      status: 404,
      code: 'custom-code123',
    };

    it('creates a json error', () => {
      expect(makeJsonError(error.message, error.status, error.code)).to.deep.equal(error);
    });

    it('uses the status as default custom code if code was not provided', () => {
      const expected = Object.assign(error, { code: error.status });
      expect(makeJsonError(error.message, error.status)).to.deep.equal(expected);
    });
  });

  describe('makeJsonApiError()', () => {
    it('defaults to internal server status if instance of Error', () => {
      const message = 'Some error.';
      expect(makesJsonApiError(new Error(message))).to.deep.equal({
        message,
        status: 500,
        code: 500,
      });
    });

    it('creates a json error from ApiError', () => {
      const apiError = new errors.NoResultError('No result', 'custom-code');
      expect(makesJsonApiError(apiError)).to.deep.equal({
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
      });
    });
  });

  describe('makeHttpClientError()', () => {
    it('creates http client error', () => {
      const error = { statusMessage: 'some message', statusCode: 418 };
      const apiError = makeHttpClientError(error);

      expect(apiError).to.be.instanceOf(errors.ApiError);
      expect(apiError).to.have.property('message', error.statusMessage);
      expect(apiError).to.have.property('code', error.statusCode);
      expect(apiError).to.have.property('status', error.statusCode);
    });

    it('creates an ApiError with status code of 408 for timeouts even status node is missing', () => {
      const error = { message: 'timeout error', code: 'ETIMEDOUT', status: undefined };
      const apiError = makeHttpClientError(error);

      expect(apiError).to.be.instanceOf(errors.ApiError);
      expect(apiError).to.have.property('message', error.message);
      expect(apiError).to.have.property('code', error.code);
      expect(apiError).to.have.property('status', 408);
    });

    it('uses message, code and status if statusMessage and statusCode are not present', () => {
      const error = { message: 'some message', code: 111, status: 418 };
      const apiError = makeHttpClientError(error);

      expect(apiError).to.be.instanceOf(errors.ApiError);
      expect(apiError).to.have.property('message', error.message);
      expect(apiError).to.have.property('code', error.code);
      expect(apiError).to.have.property('status', error.status);
    });

    it('extracts response object from a different http client', () => {
      const error = { response: { statusText: 'Bad Request', status: 400 } };
      const apiError = makeHttpClientError(error);

      expect(apiError).to.be.instanceOf(errors.ApiError);
      expect(apiError).to.have.property('code', error.response.status);
      expect(apiError).to.have.property('status', error.response.status);
      expect(apiError).to.have.property('message', error.response.statusText);
    });

    it('extracts error object from a response data over the generic status and message', () => {
      const dataError = {
        message: 'Client Error: Bad Request',
        custom_code: 114,
        status_code: 400,
      };

      const error = {
        response: {
          statusText: 'Bad Request',
          status: 400,
          data: {
            results: { error: dataError },
          },
        },
      };

      const apiError = makeHttpClientError(error);

      expect(apiError).to.be.instanceOf(errors.ApiError);
      expect(apiError).to.have.property('code', dataError.custom_code);
      expect(apiError).to.have.property('status', dataError.status_code);
      expect(apiError).to.have.property('message', dataError.message);
    });
  });
});
