import './bootstrap';
import app from './app';
import Logger from './core/Logger';
import { isNewrelicEnabled } from './core/helpers';
import { ApplicationError } from './errors/classes/ApplicationError';

const port = process.env.APP_PORT || 3000;
const server = app.listen(port);

process.on('unhandledRejection', (error) => {
  Logger.error(error);

  if (isNewrelicEnabled()) {
    // eslint-disable-next-line global-require
    const newrelic = require('newrelic');
    newrelic.noticeError(new ApplicationError(error.message), error);
  }
});

server.on('listening', () => {
  if (!isNewrelicEnabled()) {
    Logger.info('New relic is disabled.');
  }

  Logger.info(`Listening on port ${server.address().port}`);
});
