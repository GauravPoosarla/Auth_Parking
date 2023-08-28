const Boom = require('@hapi/boom');
const authServices = require('../../src/services/authService');
const authUtils = require('../../src/utils/authUtils');
const db = require('../../database/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('ioredis');

describe('authServices', () => {
  describe('register', () => {
    it('should return "User created successfully"', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'testPassword';

      jest.spyOn(db.User, 'findOne').mockResolvedValue(null);
      jest.spyOn(db.User, 'create').mockResolvedValue({});
      
      const result = await authServices.register(mockEmail, mockPassword);
      expect(result).toEqual('User created successfully');
    });

    it('should throw Boom.badRequest when user already exists', async () => {
      const mockEmail = 'existing@example.com';
      const mockPassword = 'testPassword';

      jest.spyOn(db.User, 'findOne').mockResolvedValue({});

      await expect(authServices.register(mockEmail, mockPassword)).rejects.toEqual(Boom.badRequest('User already exists'));
    });
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'testPassword';

      jest.spyOn(db.User, 'findOne').mockResolvedValue({ email: mockEmail, password: mockPassword });
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(authUtils, 'generateToken').mockReturnValue('mockToken');
      jest.spyOn(authUtils, 'putToken').mockReturnValue('mockToken');

      const result = await authServices.login(mockEmail, mockPassword);
      expect(result).toEqual('mockToken');
    });

    it('should throw Boom.notFound if user not found', async () => {
      const mockEmail = 'nonexistent@example.com';
      const mockPassword = 'testPassword';

      jest.spyOn(db.User, 'findOne').mockResolvedValue(null);

      await expect(authServices.login(mockEmail, mockPassword)).rejects.toEqual(Boom.notFound('User not found'));
    });

    it('should throw Boom.badRequest for invalid password', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'invalidPassword';

      jest.spyOn(db.User, 'findOne').mockResolvedValue({ email: mockEmail, password: 'testPassword' });
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(authServices.login(mockEmail, mockPassword)).rejects.toEqual(Boom.badRequest('Invalid password'));
    });
  });

  describe('validate', () => {
    it('should return decoded token for valid token', async () => {
      const mockToken = 'validToken';

      jest.spyOn(authUtils, 'checkTokenExists').mockResolvedValue(true);
      jest.spyOn(authUtils, 'generateToken').mockReturnValue(mockToken);
      jest.spyOn(jwt, 'verify').mockReturnValue({ email: 'test@example.com', role: 'user' });

      const result = await authServices.validate(mockToken);
      expect(result).toEqual({ email: 'test@example.com', role: 'user' });
    });

    it('should throw Boom.unauthorized for invalid token', async () => {
      const mockToken = 'invalidToken';

      jest.spyOn(authUtils, 'checkTokenExists').mockResolvedValue(false);

      await expect(authServices.validate(mockToken)).rejects.toEqual(Boom.unauthorized('Invalid token'));
    });
  });
});
