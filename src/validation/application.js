const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const createApplicationSchema = (req, res, next) => {
  const schema = Joi.object().keys({
    id: Joi.objectId().required(),
  });

  req.schema = schema;

  next();
};

const cancelApplicationSchema = (req, res, next) => {
  const schema = Joi.object().keys({});

  req.schema = schema;

  next();
};

module.exports = {
  createApplicationSchema,
  cancelApplicationSchema,
};
