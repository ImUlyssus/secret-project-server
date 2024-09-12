require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DEVELOPMENT_USERNAME,
    password: process.env.DEVELOPMENT_PASSWORD,
    database: process.env.DEVELOPMENT_DATABASE,
    host: process.env.DEVELOPMENT_HOST,
    dialect: 'mysql',
    client_url: process.env.DEVELOPMENT_CLIENT_URL
  },
  test: {
    username: process.env.TEST_USERNAME,
    password: process.env.TEST_PASSWORD,
    database: process.env.TEST_DATABASE,
    host: process.env.TEST_HOST,
    dialect: 'mysql',
    client_url: process.env.TEST_CLIENT_URL
  },
  production: {
    username: process.env.PRODUCTION_USERNAME,
    password: process.env.PRODUCTION_PASSWORD,
    database: process.env.PRODUCTION_DATABASE,
    host: process.env.PRODUCTION_HOST,
    dialect: 'mysql',
    client_url: process.env.PRODUCTION_CLIENT_URL
  },
};
