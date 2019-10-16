export default {
  prefix: process.env.CACHE_PREFIX || '',
  driver: process.env.CACHE_DRIVER || 'null',
  clients: {
    null: {},
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      db: process.env.REDIS_DB || 0,
      password: process.env.REDIS_PASSWORD,
    },
  },
};
