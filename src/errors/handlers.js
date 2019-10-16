import Promise from 'bluebird';
import Logger from '../core/Logger';
import { makesJsonApiError } from './make';

/**
 * Error handler for composite calls.
 *
 * @param {Error} error
 *
 * @returns {Promise<Object>}
 */
export function compositeErrorHandler(error) {
  Logger.error(error);

  return Promise.resolve({ error: makesJsonApiError(error) });
}
