import _ from 'lodash';
import { createLogger, format, transports } from 'winston';

const DEBUG = process.env.NODE_ENV !== 'production';

class Logger {
  /**
   * Instance getter for the logger
   *
   * @static
   * @returns
   */
  static instance() {
    if (!this.logger) {
      const logger = createLogger({
        format: format.combine(
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          format.splat(),
          format.errors(),
          format.json(),
        ),
        transports: _.values(this.transports()),
        exitOnError: false, // do not exit on handled exceptions
      });

      this.logger = logger;
    }

    this._enableLogging();

    return this.logger;
  }

  /**
   * Disable/Enable logging on run time.
   *
   * @static
   */
  static _enableLogging() {
    const env = process.env.ENABLE_LOGGING;
    const enabled = _.isUndefined(env) ? true : _.parseInt(env) === 1;

    _.each(this.logTransports, (transport) => {
      // eslint-disable-next-line no-param-reassign
      transport.silent = !enabled;
    });
  }

  /**
   * Log transports getter.
   *
   * @static
   * @returns {Object}
   */
  static transports() {
    if (!this.logTransports) {
      const opts = this._transportOptions();

      this.logTransports = {
        console: new transports.Console(opts.console),
      };
    }

    return this.logTransports;
  }

  /**
   * Default transport options.
   *
   * @returns {Object}
   */
  static _transportOptions() {
    const consoleOpts = {
      level: DEBUG ? 'debug' : 'info',
      handleExceptions: true,
      json: false,
      colorize: true,
    };

    return {
      console: consoleOpts,
    };
  }
}

// we will use Proxy here to use winstons Logger instance
// methods when we use e.g. Logger.info(), Logger.error()
// which are not in our Logger's class.
const handler = {
  get: (object, property) => {
    if (property in object) {
      return object[property];
    }

    return Logger.instance()[property];
  },
};

export default new Proxy(Logger, handler);
