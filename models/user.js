const Joi = require("joi");

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email({
      minDomainSegments: 2,
    }),
    password: Joi.string().allow("").required(),
  });

  return schema.validate(user);
}

module.exports.validateuser = validateUser;