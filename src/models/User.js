const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const cloudinary = require('cloudinary').v2;

const CustomError = require('../errors');
const customUtils = require('../utils');
const Application = require('./Application');
const Property = require('./Property');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide name'],
    },
    email: {
      type: String,
      trim: true,
      required: [true, 'Please provide email'],
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Please provide password'],
    },
    role: {
      type: String,
      trim: true,
      enum: {
        values: ['tenant', 'landlord'],
        message: '{VALUE} is not supported',
      },
      default: 'tenant',
    },
    dob: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    profileImageId: {
      type: String,
    },
    authenticationPlatform: {
      type: String,
      enum: {
        values: ['app', 'google'],
        message: '{VALUE} is not supported',
      },
      default: 'app',
    },
    verificationCode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Date,
    },
    passwordCode: {
      type: String,
    },
    passwordCodeExpirationDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre('validate', async function () {
  const isModified = this.isModified('password');
  if (!isModified) return;
  const isPasswordStrong = validator.isStrongPassword(this.password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
  if (!isPasswordStrong)
    throw new CustomError.BadRequestError('Please provide strong password');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre('deleteOne', async function () {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) {
    return;
  }
  await Application.deleteMany({ tenant: docToDelete._id });
  const properties = await Property.find({
    landlord: docToDelete._id,
  });
  for (const property of properties) {
    await Property.deleteOne({
      _id: property._id,
    });
  }
  if (docToDelete.profileImageId) {
    await cloudinary.uploader.destroy(docToDelete.profileImageId);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  if (!isMatch)
    throw new CustomError.UnauthenticatedError(
      'Please provide valid credentials'
    );
};

UserSchema.methods.compareVerificationCode = function (code) {
  const isMatch = this.verificationCode === customUtils.hashString(code);
  if (!isMatch)
    throw new CustomError.UnauthenticatedError('Verification failed');
  this.isVerified = true;
  this.verified = Date.now();
  this.verificationCode = '';
};

UserSchema.methods.checkPasswordCodeValidity = function () {
  const isExpired = customUtils.checkTimeExpired(
    this.passwordCodeExpirationDate
  );

  if (!isExpired && this.passwordCode)
    throw new CustomError.ConflictError('Password reset code already sent');
};

UserSchema.methods.verifyPasswordCode = function (code, password) {
  if (!this.passwordCodeExpirationDate || !this.passwordCode) {
    throw new CustomError.UnauthenticatedError(
      'Please generate forgot password code'
    );
  }
  const isExpired = customUtils.checkTimeExpired(
    this.passwordCodeExpirationDate
  );

  if (isExpired)
    throw new CustomError.UnauthenticatedError(
      'Password reset code has expired'
    );

  const isMatch = this.passwordCode === customUtils.hashString(code);
  if (!isMatch)
    throw new CustomError.UnauthenticatedError('Verification failed');
  this.password = password;
  this.passwordCode = null;
  this.passwordCodeExpirationDate = null;
};

UserSchema.methods.checkAuthorized = function () {
  if (!this.isVerified) {
    throw new CustomError.UnauthorizedError('Please verify your email');
  }
};

module.exports = mongoose.model('User', UserSchema);
