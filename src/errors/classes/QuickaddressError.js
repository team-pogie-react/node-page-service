import HTTP from 'http-status-codes';
import ApiError from './ApiError';

export default class QuickaddressError extends ApiError {
  /** @inheritdoc */
  constructor(message) {
    let newMessage = message;
    let code = HTTP.UNPROCESSABLE_ENTITY;

    if (typeof message === 'object') {
      const { QAFault } = message;
      newMessage = QAFault.ErrorMessage;
      code = QAFault.ErrorCode;
    }

    super(newMessage, code, HTTP.UNPROCESSABLE_ENTITY);
  }
}
