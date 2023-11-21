const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const CustomError = require('../errors');
const customUtils = require('../utils');

const register = async (req, res) => {
  const verificationCode = customUtils.createRandomOtp();

  console.log({ verificationCode });

  const user = await User.create({
    ...req.body,
    verificationCode: customUtils.hashString(verificationCode),
  });

  await customUtils.sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationCode,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: `Email verification code sent to ${user.email}` });
};

const verify = async (req, res) => {
  const { email, verificationCode } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  if (user.isVerified) {
    throw new CustomError.ConflictError('Already verified');
  }

  user.compareVerificationCode(verificationCode);

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email verified successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError(
      `${email} does not exist, please register`
    );
  }

  user.checkPasswordCodeValidity();

  const passwordCode = customUtils.createRandomOtp();

  console.log({ passwordCode });

  const tenMinutes = 1000 * 60 * 10;
  const passwordCodeExpirationDate = Date.now() + tenMinutes;

  user.passwordCode = customUtils.hashString(passwordCode);
  user.passwordCodeExpirationDate = passwordCodeExpirationDate;

  await user.save();

  await customUtils.sendResetPasswordEmail({
    name: user.name,
    email: user.email,
    passwordCode,
  });

  res
    .status(StatusCodes.OK)
    .json({ msg: `Password reset code sent to ${user.email}` });
};

const resetPassword = async (req, res) => {
  const { passwordCode, email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  user.verifyPasswordCode(passwordCode, password);

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Password changed successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError(
      `${email} does not exist, please register`
    );
  }

  user.checkAuthorized();

  await user.comparePassword(password);

  const tokenUser = customUtils.createTokenUser(user);

  customUtils.attachCookiesToResponse({ res, tokenUser });

  res.status(StatusCodes.OK).json({
    userId: user._id,
    name: user.name,
    role: user.role,
    profileImage: user.profileImage,
  });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    maxAge: 0,
    secure: true,
    signed: true,
    // sameSite: 'none',
  });

  res.status(StatusCodes.OK).json({
    msg: 'Logged out successfully',
  });
};

module.exports = {
  register,
  verify,
  forgotPassword,
  resetPassword,
  login,
  logout,
};
