/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import Debugger from '../../../src/core/Debugger';

describe('Debugger Test', () => {
  describe('collect()', () => {
    it('adds debug data to the current collection', () => {
      Debugger.reset();
      Debugger.collect({ time: 123 });
      Debugger.collect({ isTrue: false });

      expect(Debugger.data()).to.deep.equal({
        time: 123,
        isTrue: false,
      });
    });
  });
});
