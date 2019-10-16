/* eslint-disable global-require */
const env = process.env.NEW_RELIC_ENABLED;
const enabled = env !== 'undefined' ? parseInt(env, 10) : 1;

if (enabled === 1) {
  require('newrelic');
}
