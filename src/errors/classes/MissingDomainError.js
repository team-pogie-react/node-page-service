import HTTP from 'http-status-codes';
import ApiError from './ApiError';

export default class MissingDomainError extends ApiError {
  /** @inheritdoc */
  constructor(message, code = HTTP.BAD_REQUEST, ...args) {
    super(message, code, HTTP.BAD_REQUEST, ...args);
  }
}
