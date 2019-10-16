import os from 'os';
import pidusage from 'pidusage';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { THRESHOLDS } from '../configs/healthcheck';
import { statusFromThreshold, getStatus } from '../core/library/healthcheck';

class IndexController {
  /**
   * Ping endpoint.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object}
   */
  ping(request, response) {
    return response.withData({
      success: true,
      code: 200,
    });
  }

  /**
   * Health endpoint.
   *
   * @param {Object} request
   * @param {Object} response
   *
   * @returns {Object}
   */
  async health(request, response) {
    try {
      const stat = await pidusage(process.pid);
      const status = this._getStatus(stat);

      return response.json({
        status,
        details: {
          cpu: stat.cpu,
          memory: stat.memory / 1024 / 1024, // Convert from B to MB
          load: os.loadavg(),
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      return response.withError(error.message, INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Determines status based on the set thresholds.
   *
   * @param {Object} stat
   *
   * @returns {String}
   */
  _getStatus(stat) {
    const memoryPercent = (stat.memory / os.totalmem()) * 100;

    return getStatus([
      statusFromThreshold(memoryPercent, THRESHOLDS.memory),
      statusFromThreshold(stat.cpu, THRESHOLDS.cpu),
    ]);
  }
}

export default IndexController;
