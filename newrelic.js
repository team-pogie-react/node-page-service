/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
  },
  /**
   * When true, all request headers except for those listed in attributes.exclude
   * will be captured for all traces, unless otherwise specified in a destination's
   * attributes include/exclude lists.
   */
  allow_all_headers: true,
  attributes: {
    /**
     * Prefix of attributes to exclude from all destinations. Allows * as wildcard
     * at end.
     *
     * NOTE: If excluding headers, they must be in camelCase form to be filtered.
     *
     * @env NEW_RELIC_ATTRIBUTES_EXCLUDE
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },

  /**
   * Controls the method of cross agent tracing in the agent.
   * Distributed tracing lets you see the path that a request takes through your
   * distributed system. Enabling distributed tracing changes the behavior of some
   * New Relic features, so carefully consult the transition guide before you enable
   * this feature: https://docs.newrelic.com/docs/transition-guide-distributed-tracing
   * Default is false.
   */
  distributed_tracing: {
    /**
     * Enables/disables distributed tracing.
     *
     * @env NEW_RELIC_DISTRIBUTED_TRACING_ENABLED
     */
    enabled: true,
  },

  /**
   * Whether to collect & submit error traces to New Relic.
   *
   * @env NEW_RELIC_ERROR_COLLECTOR_ENABLED
   */
  error_collector: {
    attributes: {
      /**
       * If `true`, the agent captures attributes from error collection.
       *
       * @env NEW_RELIC_ERROR_COLLECTOR_ATTRIBUTES_ENABLED
       */
      enabled: true,
      /**
       * Prefix of attributes to exclude from error collection.
       * Allows * as wildcard at end.
       *
       * @env NEW_RELIC_ERROR_COLLECTOR_ATTRIBUTES_EXCLUDE
       */
      exclude: [],
      /**
       * Prefix of attributes to include in error collection.
       * Allows * as wildcard at end.
       *
       * @env NEW_RELIC_ERROR_COLLECTOR_ATTRIBUTES_INCLUDE
       */
      include: [],
    },

    /**
     * Disabling the error tracer just means that errors aren't collected
     * and sent to New Relic -- it DOES NOT remove any instrumentation.
     */
    enabled: true,

    /**
     * List of HTTP error status codes the error tracer should disregard.
     * Ignoring a status code means that the transaction is not renamed to
     * match the code, and the request is not treated as an error by the error
     * collector.
     *
     * NOTE: This configuration value has no effect on errors recorded using
     * `noticeError()`.
     *
     * Defaults to 404 NOT FOUND.
     *
     * @env NEW_RELIC_ERROR_COLLECTOR_IGNORE_ERROR_CODES
     */
    ignore_status_codes: [],

    /**
     * Whether error events are collected.
     */
    capture_events: true,

    /**
     * The agent will collect all error events up to this number per minute.
     * If there are more than that, a statistical sampling will be collected.
     * Currently this uses a priority sampling algorithm.
     *
     * By increasing this setting you are both increasing the memory
     * requirements of the agent as well as increasing the payload to the New
     * Relic servers. The memory concerns are something you should consider for
     * your own server's sake. The payload of events is compressed, but if it
     * grows too large the New Relic servers may reject it.
     */
    max_event_samples_stored: 100,
  },
};
