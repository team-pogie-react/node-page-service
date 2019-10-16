export default class Stopwatch {
  /**
   * Create instance of Stopwatch.
   */
  constructor() {
    this._time = null;
  }

  /**
   * Factory for stopwatch.
   *
   * @returns {Stopwatch}
   */
  static create() {
    return new Stopwatch();
  }

  /**
   * Record the start.
   */
  start() {
    this._time = process.hrtime();
  }

  /**
   * Calculate the elapsed time in MS.
   *
   * @returns {Float} elapsed time in ms
   */
  stop() {
    const elapsed = process.hrtime(this._time);
    const inMs = elapsed[0] * 1000 + elapsed[1] / 1e6;

    return inMs;
  }
}
