const Boom = require('@hapi/boom');
const db = require('../../database/models');
const authUtils = require('../utils/authUtils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (email, password) => {
  const userExists = await db.User.findOne({
    where: {
      email,
    },
  });

  if (userExists) {
    throw Boom.badRequest('User already exists');
  }

  db.User.create({
    email,
    password: bcrypt.hashSync(password, 10),
  });
  return 'User created successfully';
};

const login = async (email, password) => {
  const user = await db.User.findOne({
    where: {
      email,
    },
  });
  if (!user) {
    throw Boom.notFound('User not found');
  }
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    throw Boom.badRequest('Invalid password');
  }
  const token = authUtils.generateToken(user.email);
  authUtils.putToken(token);
  return token;
};

const validate = async (token) => {
  const tokenExists = await authUtils.checkTokenExists(token);
  if (!tokenExists) {
    throw Boom.unauthorized('Invalid token');
  }
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    return decodedToken;
  } catch (error) {
    throw Boom.unauthorized('Invalid token');
  }
};

module.exports = {
  register,
  login,
  validate,
};
