import { each, size, isArray } from 'lodash';
import HTTP from 'http-status-codes';
import Debugger from '../core/Debugger';
import { makeJsonError } from '../errors/make';
import Stopwatch from '../core/Stopwatch';
import Logger from '../core/Logger';

/**
 * Nodes of data could be for a composite route response
 * or a normal route response. This method processes data
 * differently for the composite route response.
 *
 * @param {Array|Object} nodes
 *
 * @returns {Array|Object}
 */
function processData(nodes) {
  const newNodes = isArray(nodes) ? [] : {};
  const errors = [];

  each(nodes, (data, name) => {
    let node = data;

    if (data && data.error) {
      const source = `/data/${name}`;
      node = null; // empty original node
      errors.push(Object.assign({ source: { node: source } }, data.error));
    }

    newNodes[name] = node;
  });

  const result = { data: newNodes };

  if (size(errors) > 0) {
    result.errors = errors;
  }

  return result;
}

/**
 * Helper methods for the Response object.
 *
 * @returns {Object}
 */
function customMethods() {
  return {
    setCompositeStatus(result) {
      let status = HTTP.OK;
      const { data, errors } = result;

      const nodeCount = size(data);
      const errorCount = size(errors);

      if (errorCount > 0) {
        status = HTTP.PARTIAL_CONTENT;
      }

      if (errorCount >= nodeCount || this._hasWidgetError(data)) {
        status = HTTP.INTERNAL_SERVER_ERROR;
      }

      return this.status(status);
    },

    _hasWidgetError(data) {
      if (!data) {
        return false;
      }

      const { widgets } = data;

      if (widgets === null) {
        return true;
      }

      return false;
    },

    withData(data) {
      const result = processData(data);

      return this.setCompositeStatus(result).json(result);
    },

    withInternalError(message) {
      return this.withError(message, HTTP.INTERNAL_SERVER_ERROR);
    },

    withNotFoundError(message) {
      return this.withError(message, HTTP.NOT_FOUND);
    },

    withError(message, status, errorCode = null) {
      Logger.error(message, { status, errorCode });

      return this.status(status).json({ errors: [makeJsonError(message, status, errorCode)] });
    },
  };
}

// Add custom response methods
export default (request, response, next) => {
  Object.assign(response, customMethods());

  const { query } = request;

  // record debug data when debug is enabled.
  if (Boolean(query.debug) === true) {
    const watch = Stopwatch.create();
    watch.start();

    Object.assign(response, {
      withData(data) {
        const debug = {
          elapsed: watch.stop(),
          version: process.env.npm_package_version,
          env: process.env.NODE_ENV,
        };
        const devVersion = process.env.DEV_VERSION;

        if (devVersion) {
          debug.devVersion = devVersion;
        }

        Debugger.collect(debug);

        const result = processData(data);

        return this.setCompositeStatus(result)
          .json(Object.assign({ debug: Debugger.data() }, result));
      },
    });
  }

  next();
};
