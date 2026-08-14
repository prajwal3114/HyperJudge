const Redis = require('ioredis');
const config = require('../config/env');

// Connection options
const redisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Create distinct isolated Redis clients for different responsibilities
const cacheClient = new Redis(redisOptions);
const pubClient = new Redis(redisOptions); // For publishing to pub/sub
const subClient = new Redis(redisOptions); // For subscribing to pub/sub
const rateLimitClient = new Redis(redisOptions);
const leaderboardClient = new Redis(redisOptions);

module.exports = {
  cacheClient,
  pubClient,
  subClient,
  rateLimitClient,
  leaderboardClient
};
