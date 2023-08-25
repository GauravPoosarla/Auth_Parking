const Joi = require('joi');

const credentialsSchema = Joi.object({
  email: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(3).max(30).required()
});

const tokenSchema = Joi.string().required();

module.exports = { credentialsSchema, tokenSchema };
