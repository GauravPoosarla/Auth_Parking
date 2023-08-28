const Boom = require('@hapi/boom');
const authUtils = require('../../src/utils/authUtils');
const redisClient = require('../../src/utils/redis'); 
const jwt = require('jsonwebtoken');

jest.mock('ioredis');
jest.mock('../../src/utils/redis.js'); 

describe('authUtils', () => {
  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const mockUsername = 'testUser';
      const mockRole = 'user';

      jest.spyOn(jwt,'sign').mockResolvedValue('token');
      const result = authUtils.generateToken(mockUsername, mockRole);

      expect(result).toBeDefined();
    });
  });

  describe('putToken', () => {
    it('should successfully store token in Redis', async () => {
      const mockToken = 'mockToken';
      jest.spyOn(redisClient, 'set').mockResolvedValue(true);
      await authUtils.putToken(mockToken);
    });

    it('should throw Boom.badImplementation on Redis error', async () => {
      const mockToken = 'mockToken';
      jest.spyOn(redisClient, 'set').mockRejectedValue(new Error('Redis error'));

      await expect(authUtils.putToken(mockToken)).rejects.toEqual(
        Boom.badImplementation('Error while putting token in Redis')
      );
    });
  });

  describe('checkTokenExists', () => {
    it('should return true if token exists in Redis', async () => {
      const mockToken = 'mockToken';
      jest.spyOn(redisClient, 'get').mockResolvedValue('true');

      const result = await authUtils.checkTokenExists(mockToken);
      expect(result).toBe(true);
    });

    it('should return false if token does not exist in Redis', async () => {
      const mockToken = 'mockToken';
      jest.spyOn(redisClient, 'get').mockResolvedValue(null);

      const result = await authUtils.checkTokenExists(mockToken);
      expect(result).toBe(false);
    });

    it('should throw Boom.badImplementation on Redis error', async () => {
      const mockToken = 'mockToken';
      jest.spyOn(redisClient, 'get').mockRejectedValue(new Error('Redis error'));

      await expect(authUtils.checkTokenExists(mockToken)).rejects.toEqual(
        Boom.badImplementation('Error while checking token in Redis')
      );
    });
  });
});
