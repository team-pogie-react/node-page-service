/* eslint-env mocha */
export function itOrSkip(name, value, callback) {
  const fn = value ? it : it.skip;
  fn(name, callback);
}
