/* eslint-env mocha */
/* eslint no-unused-expressions: 0 */
import sinon from 'sinon';
import { expect } from 'chai';
import Stopwatch from '../../../src/core/Stopwatch';

describe('Stopwatch Test', () => {
  let clock;
  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => clock.restore());

  it('creates an instance of Stopwatch', () => {
    expect(Stopwatch.create()).to.be.an.instanceOf(Stopwatch);
  });

  it('captures elapsed time', () => {
    const watch = Stopwatch.create();
    watch.start();
    clock.tick(100);

    const elapsed = watch.stop();

    expect(elapsed).to.be.equal(100);
  });
});
