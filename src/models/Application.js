const mongoose = require('mongoose');

const customUtils = require('../utils');
const CustomError = require('../errors');

const ApplicationSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ tenant: 1, property: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
