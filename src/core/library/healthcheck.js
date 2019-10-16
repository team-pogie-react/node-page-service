import { STATUS } from '../../configs/healthcheck';

/**
 * Get status comparing value with the set thresholds.
 *
 * @param {Float} value
 * @param {Object} thresholds
 *
 * @returns {String}
 */
export function statusFromThreshold(value, thresholds) {
  if (value >= thresholds.bad) {
    return STATUS.BAD;
  }

  if (value >= thresholds.warn) {
    return STATUS.WARNING;
  }

  return STATUS.GOOD;
}

/**
 * Get node status GOOD|WARNING|BAD
 *
 * @param {Array} stats
 *
 * @returns {String}
 */
export function getStatus(stats) {
  if (stats.indexOf(STATUS.BAD) !== -1) {
    return STATUS.BAD;
  }

  if (stats.indexOf(STATUS.WARNING) !== -1) {
    return STATUS.WARNING;
  }

  return STATUS.GOOD;
}
