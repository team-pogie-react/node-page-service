import HTTP from 'http-status-codes';
import CacheInstance from '../core/Cache';

class CacheController {
  /**
   * Create controller instance.
   */
  constructor() {
    this.cache = CacheInstance;
  }

  /**
   * List all cache. Or not.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object}
   */
  index(request, response) {
    return response.withData({
      message: "Nope, we don't display all cache. :)",
      code: HTTP.OK,
    });
  }

  /**
   * Get a cache by key.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object}
   */
  async find(request, response) {
    try {
      const { key } = request.params;
      const value = await this.cache.get(key);

      return response.withData({ key, value, code: HTTP.OK });
    } catch (error) {
      return response.withInternalError(error.message);
    }
  }

  /**
   * Flush cache.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object}
   */
  async flush(request, response) {
    try {
      const { pattern } = request.query;
      let message = 'Cache has been deleted.';

      if (pattern) {
        message = `Cache with pattern "${pattern}" has been deleted.`;
        await this.cache.forgetByPattern(pattern);
      } else {
        await this.cache.flush();
      }

      return response.withData({ message, code: HTTP.OK });
    } catch (error) {
      return response.withInternalError(error.message);
    }
  }

  /**
   * Delete a cache by key.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object}
   */
  async delete(request, response) {
    try {
      const { key } = request.params;
      let code = HTTP.OK;
      let message = `Cache with key "${key}" has been deleted.`;

      const result = await this.cache.forget(key);

      if (result === false) {
        code = HTTP.NOT_MODIFIED;
        message = `Cache with key "${key}" does not exist.`;
      }

      return response.withData({ message, code });
    } catch (error) {
      return response.withInternalError(error.message);
    }
  }
}

export default CacheController;
