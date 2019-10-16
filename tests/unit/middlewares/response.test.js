/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import responseMiddleware from '../../../src/middlewares/response';

describe('Response Middleware', () => {
  const response = {
    json(data) {
      return data;
    },
    status(statusCode) {
      this.statusCode = statusCode;

      return this;
    },
  };

  beforeEach(() => {
    responseMiddleware({ query: {} }, response, () => {});
  });

  it('responds with data', () => {
    const data = { some: 'json' };
    expect(response.withData(data)).to.be.eql({ data });
  });

  it('responds with data with correct data type', () => {
    const object = response.withData({ some: 'data', null: null });
    const array = response.withData(['some', 'array']);

    expect(object.data).to.be.an('object');
    expect(array.data).to.be.an('array');
  });

  it('responds with internal server error', () => {
    const message = 'An error occurred.';
    expect(response.withInternalError(message)).to.be.eql({
      errors: [{
        message,
        status: 500,
        code: 500,
      }],
    });
  });

  it('responds with custom error', () => {
    const message = 'Im a custom error.';
    expect(response.withError(message, 418, 5001)).to.be.eql({
      errors: [{
        message,
        status: 418,
        code: 5001,
      }],
    });
  });

  it('responds with not found error', () => {
    const message = 'Not found.';
    expect(response.withNotFoundError(message)).to.be.eql({
      errors: [{
        message,
        status: 404,
        code: 404,
      }],
    });
  });

  it('includes debug in response if debug is passed in request query', () => {
    responseMiddleware({ query: { debug: true } }, response, () => {});

    const result = response.withData({ some: 'data' });

    expect(result).to.have.property('debug');
    expect(result.debug).to.include.all.keys(['version', 'env', 'elapsed']);
  });

  it('includes devVersion to debug repsonse if it exists', () => {
    responseMiddleware({ query: { debug: true } }, response, () => {});

    expect(response.withData({ some: 'data' }).debug).to.not.have.property('devVersion');

    process.env.DEV_VERSION = 'beta-1';

    expect(response.withData({ some: 'data' }).debug).to.have.property('devVersion', 'beta-1');
  });

  describe('data with errors', () => {
    const data = {
      some: 'data',
      withError: {
        error: {
          code: 'some-code',
          status: 500,
          message: 'i am an error.',
        },
      },
    };

    it('collects errors from data node and create an error node with same level as data', () => {
      const json = response.withData(data);

      expect(json).to.have.property('errors').that.is.an('array').and.has.lengthOf(1);
      expect(json.errors[0]).to.have.nested.property('source.node', '/data/withError');
      expect(json.data).to.have.property('withError', null);
    });

    it('returns 206 status when there are some errors', () => {
      response.withData(data);
      expect(response.statusCode).to.be.equal(206);

      response.withData({ no: 'error!' });
      expect(response.statusCode).to.be.equal(200);
    });

    it('returns 206 status when there are some errors on debug mode', () => {
      responseMiddleware({ query: { debug: true } }, response, () => {});

      response.withData(data);
      expect(response.statusCode).to.be.equal(206);

      response.withData({ no: 'error!' });
      expect(response.statusCode).to.be.equal(200);
    });

    it('returns 500 when errors are more then or equal the data nodes', () => {
      response.withData({ withError: data.withError });
      expect(response.statusCode).to.be.equal(500);

      responseMiddleware({ query: { debug: true } }, response, () => {});
      response.withData({ withError: data.withError });
      expect(response.statusCode).to.be.equal(500);
    });

    it('returns 500 when there is an error in widget node', () => {
      data.widgets = {
        error: {
          code: 'hmm',
          status: 500,
          message: 'is unreachable.',
        },
      };

      response.withData(data);
      expect(response.statusCode).to.be.equal(500);

      responseMiddleware({ query: { debug: true } }, response, () => {});
      response.withData(data);
      expect(response.statusCode).to.be.equal(500);
    });
  });
});
