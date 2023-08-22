const Joi = require('joi');
const authController = require('../controllers/authController');
const authSchema = require('../utils/common/schemas');

const authRoutes = [
  {
    method: 'POST',
    path: '/register',
    options: {
      validate: {
        payload: authSchema.credentialsSchema,
      },
    },
    handler: authController.register,
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      validate: {
        payload: authSchema.credentialsSchema,
      },
    },
    handler: authController.login,
  },
  {
    method: 'POST',
    path: '/validate',
    options: {
      validate: {
        headers: Joi.object({
          authorization: Joi.string().required(),
        }).options({ allowUnknown: true }),
      },
    },
    handler: authController.validate,
  },
];

module.exports = authRoutes;
