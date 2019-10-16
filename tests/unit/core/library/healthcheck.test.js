/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import { STATUS } from '../../../../src/configs/healthcheck';
import { getStatus, statusFromThreshold } from '../../../../src/core/library/healthcheck';

describe('healthcheck Test', () => {
  describe('getStatus()', () => {
    it('returns BAD when at least one BAD status was provided', () => {
      expect(getStatus([STATUS.GOOD, STATUS.BAD])).to.be.equal(STATUS.BAD);
      expect(getStatus([STATUS.WARNING, STATUS.BAD, STATUS.GOOD])).to.be.equal(STATUS.BAD);
    });

    it('returns WARNING when at least one WARNING status was provided', () => {
      expect(getStatus([STATUS.GOOD, STATUS.WARNING])).to.be.equal(STATUS.WARNING);
      expect(getStatus([STATUS.WARNING, STATUS.WARNING, STATUS.GOOD])).to.be.equal(STATUS.WARNING);
    });

    it('returns GOOD, oh yes', () => {
      expect(getStatus([STATUS.GOOD, STATUS.GOOD])).to.be.equal(STATUS.GOOD);
    });
  });

  describe('statusFromThreshold()', () => {
    const thresholds = {
      bad: 10,
      warn: 5,
    };

    it('returns BAD when threshold config meet the "bad" value', () => {
      expect(statusFromThreshold(11, thresholds)).to.be.equal(STATUS.BAD);
      expect(statusFromThreshold(10, thresholds)).to.be.equal(STATUS.BAD);
    });

    it('returns WARNING when threshold config meet the "warning" value', () => {
      expect(statusFromThreshold(9, thresholds)).to.be.equal(STATUS.WARNING);
      expect(statusFromThreshold(5, thresholds)).to.be.equal(STATUS.WARNING);
    });

    it('returns GOOD when nothing meets the threshold', () => {
      expect(statusFromThreshold(4, thresholds)).to.be.equal(STATUS.GOOD);
      expect(statusFromThreshold(1, thresholds)).to.be.equal(STATUS.GOOD);
      expect(statusFromThreshold(0, thresholds)).to.be.equal(STATUS.GOOD);
    });
  });
});
