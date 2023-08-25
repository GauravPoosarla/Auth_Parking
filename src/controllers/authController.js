const Boom = require('@hapi/boom');
const authServices = require('../services/authService');

const register = async (request, h) => {
  const { email, password} = request.payload;
  try {
    const user = await authServices.register(email, password);
    return h.response(user).code(200);
  } catch (error) {
    if(Boom.isBoom(error)) {
      return error;
    }
    return Boom.badRequest(error.message);
  }
};

const login = async (request, h) => {
  const { email, password } = request.payload;
  try {
    const token = await authServices.login(email, password);
    return h.response(token).code(200);
  } catch (error) {
    if(Boom.isBoom(error)) {
      return error;
    }
    return Boom.badRequest(error.message);
  }
};

const validate = async (request, h) => {
  const token = request.headers.authorization;
  try {
    const verifiedStatus = await authServices.validate(token);
    return h.response(verifiedStatus).code(200);
  } catch (error) {
    if(Boom.isBoom(error)) {
      return error;
    }
    return Boom.badRequest(error.message);
  }
};

module.exports = {
  register,
  login,
  validate,
};
