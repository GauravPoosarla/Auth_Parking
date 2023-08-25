const Boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const redisClient = require('./redis'); // Import the Redis instance

function generateToken(username, role) {
  const payload = {
    username,
    role,
    timestamp: new Date().getTime(),
  };
  return jwt.sign(payload, process.env.SECRET_KEY);
}

async function putToken(token) {
  try {
    await redisClient.set(token, 'true', 'EX', 60 * 60 * 24); // 24 hours expiration
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while putting token in Redis');
  }
}

async function checkTokenExists(token) {
  try {
    const result = await redisClient.get(token);
    return result === 'true';
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while checking token in Redis');
  }
}

module.exports = {
  generateToken,
  putToken,
  checkTokenExists,
};
