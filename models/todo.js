const Joi = require("joi");

function validateTodo(todo) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    due_date: Joi.date().iso().allow(null).required().messages({
      "date.base": "Due Date must be a valid date",
      "date.format": "Due Date must be in the format YYYY-MM-DD",
      "any.required": "Due Date is required",
    }),
    status: Joi.string().valid('Pending', 'Inprocess', 'Complete').required(),
    priority: Joi.string().allow(null
    ).valid('Low', 'Medium', 'High').required(),
  });
  return schema.validate(todo);
}

module.exports.validatetodo = validateTodo;