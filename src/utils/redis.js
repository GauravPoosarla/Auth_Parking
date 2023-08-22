const Redis = require('ioredis');
const config = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const redisClient = new Redis(config);

module.exports = redisClient;
