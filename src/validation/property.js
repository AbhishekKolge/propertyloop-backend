const Joi = require('joi');

const createPropertySchema = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().max(20).min(3).required(),
    description: Joi.string().trim().max(500).min(10).required(),
    location: Joi.string().trim().max(20).min(3).required(),
    furnishStatus: Joi.string().valid('unfurnished', 'furnished').required(),
    carpetArea: Joi.number().optional(),
    price: Joi.number().optional(),
    status: Joi.string().valid('open', 'closed').optional(),
  });

  req.schema = schema;

  next();
};

const updatePropertySchema = (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().trim().max(20).min(3).optional(),
    description: Joi.string().trim().max(500).min(10).optional(),
    location: Joi.string().trim().max(20).min(3).optional(),
    furnishStatus: Joi.string().valid('unfurnished', 'furnished').optional(),
    carpetArea: Joi.number().optional(),
    price: Joi.number().optional(),
    status: Joi.string().valid('open', 'closed').optional(),
  });

  req.schema = schema;

  next();
};

const deletePropertySchema = (req, res, next) => {
  const schema = Joi.object().keys({});

  req.schema = schema;

  next();
};

module.exports = {
  createPropertySchema,
  updatePropertySchema,
  deletePropertySchema,
};
