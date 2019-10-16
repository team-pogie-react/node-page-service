import { each } from 'lodash';
import Logger from '../Logger';
import { isFalsy } from '../helpers';

function _extractResponseHeaders(headers) {
  const result = {};

  each(headers, (value, key) => {
    result[key] = isFalsy(value) ? 0 : 1;
  });

  return result;
}

export function logResponse(response, stopwatch) {
  const elapsed = stopwatch.stop();
  const { config } = response;
  const method = config.method.toUpperCase();

  const context = {
    url: config.url,
    method,
    elapsed,
    headers: _extractResponseHeaders(config.headers),
    statusCode: response.statusCode,
    statusMessage: response.statusMessage,
  };

  if (method === 'POST' && process.env.NODE_ENV !== 'production') {
    context.data = config.data;
  }

  Logger.info('%s request from external service fulfilled.', method, context);

  return response;
}
