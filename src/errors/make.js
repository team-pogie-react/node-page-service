import _ from 'lodash';
import HTTP from 'http-status-codes';
import ApiError from './classes/ApiError';
import errors from '../configs/errors';
import NoResultError from './classes/NoResultError';

/**
 * Create a custom error based on the error code.
 *
 * @param {String|Integer} code
 *
 * @returns {ApiError}
 */
export function makeError(code) {
  if (!_.isUndefined(errors[code])) {
    const { message, status, class: ApiErrorClass } = errors[code];

    return new ApiErrorClass(message, code, status);
  }

  return new NoResultError(`Unknown response code: ${code}.`);
}

/**
 * Create a json error.
 *
 * @param {String} message
 * @param {Integer} status
 * @param {String|Integer} errorCode
 *
 * @returns {Object}
 */
export function makeJsonError(message, status, errorCode = null) {
  const code = errorCode || status;

  return { message, status, code };
}

/**
 * Make a json error out of the error instance.
 *
 * @param {Error} error
 *
 * @returns {Object}
 */
export function makesJsonApiError(error) {
  if (error instanceof ApiError) {
    return makeJsonError(error.message, error.status, error.code);
  }

  return makeJsonError(error.message, HTTP.INTERNAL_SERVER_ERROR);
}

/**
 * Extract error node from response data.
 *
 * @param {Object} error
 *
 * @returns {ApiError}
 */
function _makeResponseClientError(error) {
  const { results } = error.data;

  return new ApiError(
    results.error.message,
    results.error.custom_code,
    results.error.status_code,
  );
}

/**
 * Make a client http error out of the error instance.
 *
 * @param {Error} error
 *
 * @returns {ApiError}
 */
export function makeHttpClientError(error) {
  if (error.response && error.response.data && error.response.data.results) {
    return _makeResponseClientError(error.response);
  }

  const errorResponse = error.response || error;
  const {
    statusMessage,
    statusText,
    statusCode,
    code,
    status,
    message,
  } = errorResponse;

  let errorStatus = statusCode || status || HTTP.INTERNAL_SERVER_ERROR;
  const errorMessage = statusMessage || statusText || message || 'Internal error!';
  const errorCode = code || errorStatus || HTTP.INTERNAL_SERVER_ERROR;

  if (errorCode === 'ETIMEDOUT') {
    errorStatus = HTTP.REQUEST_TIMEOUT;
  }

  return new ApiError(errorMessage, errorCode, errorStatus);
}
