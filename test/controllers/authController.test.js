const authController = require('../../src/controllers/authController');
const authServices = require('../../src/services/authService');
const Boom = require('@hapi/boom');

jest.mock('ioredis');

describe('authController', () => {
  describe('register', () => {
    it('returns a message "User created successfully" on successful registration', async () => {
      const mockRequest = {
        payload: {
          email: 'user@gmail.com',
          password: 'password',
        },
      };
      const mockH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn(),
      };

      const mockRegister = jest.spyOn(authServices, 'register');
      mockRegister.mockResolvedValue('User created successfully');

      await authController.register(mockRequest, mockH);

      expect(mockH.response).toHaveBeenCalledWith('User created successfully');
      expect(mockH.code).toHaveBeenCalledWith(200);
    });

    it('returns a Boom.badRequest error if user already exists', async () => {
      const mockRequest = {
        payload: {
          email: 'existingUser@gmail.com',
          password: 'password',
        },
      };
      const mockH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn()
      };

      const mockRegister = jest.spyOn(authServices, 'register');
      mockRegister.mockRejectedValue(Boom.badRequest('User already exists'));

      const response = await authController.register(mockRequest, mockH);

      expect(response.isBoom).toBe(true);
      expect(response.output.statusCode).toBe(400);
      expect(response.message).toBe('User already exists');
    });

    it('returns a Boom.badRequest error on other registration errors', async () => {
      const mockRequest = {
        payload: {
          email: 'invalidEmail',
          password: 'password',
        },
      };
      const mockH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn()
      };

      const mockRegister = jest.spyOn(authServices, 'register');
      mockRegister.mockRejectedValue(new Error('Invalid email format'));

      const response = await authController.register(mockRequest, mockH);

      expect(response.isBoom).toBe(true);
      expect(response.output.statusCode).toBe(400);
      expect(response.message).toBe('Invalid email format');
    });
  });
  describe('login', () => {
    it('returns a token on successful login', async () => {
      const mockRequest = {
        payload: {
          email: 'valid@example.com',
          password: 'validpassword',
        },
      };
      const mockH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn()
      };

      const mockLogin = jest.spyOn(authServices, 'login');
      mockLogin.mockResolvedValue('token');

      await authController.login(mockRequest, mockH);
      
      expect(mockH.response).toHaveBeenCalledWith('token');
      expect(mockH.code).toHaveBeenCalledWith(200);
    });

    it('returns an error on invalid credentials', async () => {
      const mockRequest = {
        payload: {
          email: 'invalid@example.com',
          password: 'invalidpassword',
        },
      };
      const mockH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn()
      };

      const mockLogin = jest.spyOn(authServices, 'login');
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      const result = await authController.login(mockRequest, mockH);

      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(400);
      expect(result.message).toBe('Invalid credentials');
    });
  });
  describe('validate', () => {
    it('returns verified status on valid token', async () => {
      const mockToken = 'valid-token';
      const mockRequest = {
        headers: {
          authorization: mockToken,
        },
      };

      const mockH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn(),
      };

      const mockValidate = jest.spyOn(authServices, 'validate');
      mockValidate.mockResolvedValue('verified');

      await authController.validate(mockRequest, mockH);

      expect(mockH.response).toHaveBeenCalledWith('verified');
      expect(mockH.code).toHaveBeenCalledWith(200);
    });

    it('returns an error on invalid token', async () => {
      const mockToken = 'invalid-token';
      const mockRequest = {
        headers: {
          authorization: mockToken,
        },
      };

      const mockH = {
        response: jest.fn().mockReturnThis(),
        code: jest.fn(),
      };

      const mockValidate = jest.spyOn(authServices, 'validate');
      mockValidate.mockRejectedValue(Boom.unauthorized('Invalid token'));

      const result = await authController.validate(mockRequest, mockH);
      expect(result.isBoom).toBe(true);
      expect(result.output.statusCode).toBe(401);
      expect(result.message).toBe('Invalid token');
    });
  });
});
