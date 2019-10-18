export default {
  prefix: process.env.DATABASE_PREFIX || '',
  driver: process.env.DATABASE_DRIVER || 'null',
  clients: {
    mysql: {
      host: process.env.DATABASE_HOST || 'localhost',
      name: process.env.DATABASE_NAME || 'test',
      username: process.env.DATABASE_USERNAME || 'test',
      password: process.env.DATABASE_PASSWORD,
    },
  },
};
