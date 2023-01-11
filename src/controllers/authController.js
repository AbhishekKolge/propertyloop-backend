const { StatusCodes } = require("http-status-codes");

const User = require("../models/User");
const Token = require("../models/Token");
const CustomError = require("../errors");
const customUtils = require("../utils");

const register = async (req, res) => {
  const { firstName, email, password, companyName, role } = req.body;

  if (!email || !firstName || !password) {
    throw new CustomError.BadRequestError("Please provide all fields");
  }

  if (role === "employer" && !companyName) {
    throw new CustomError.BadRequestError("Please provide company name");
  }

  if (role !== "employer") {
    delete req.body.companyName;
  }

  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) {
    throw new CustomError.ConflictError("Email already exists");
  }

  const verificationToken = customUtils.createRandomBytes();

  const user = await User.create({
    ...req.body,
    verificationToken: customUtils.hashString(verificationToken),
  });

  await customUtils.sendVerificationEmail({
    name: user.firstName,
    email: user.email,
    verificationToken,
    origin: customUtils.getOrigin(req),
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: `Email verification link sent to ${user.email}` });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError(
      `${email} does not exist, please register`
    );
  }

  await user.comparePassword(password);

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email");
  }

  const tokenUser = customUtils.createTokenUser(user);

  let refreshToken = "";

  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;

    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Not authenticated");
    }
    refreshToken = existingToken.refreshToken;
    const { accessTokenJWT, refreshTokenJWT } = customUtils.getJWTToken({
      user: tokenUser,
      refreshToken,
    });

    return res.status(StatusCodes.OK).json({
      accessToken: accessTokenJWT,
      refreshToken: refreshTokenJWT,
      role: user.role,
      userId: user._id,
    });
  }

  refreshToken = customUtils.createRandomBytes();
  const userAgent = customUtils.getUserAgent(req);
  const ip = customUtils.getRequestIp(req);
  await Token.create({
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  });
  const { accessTokenJWT, refreshTokenJWT } = customUtils.getJWTToken({
    user: tokenUser,
    refreshToken,
  });

  res.status(StatusCodes.OK).json({
    accessToken: accessTokenJWT,
    refreshToken: refreshTokenJWT,
    role: user.role,
    userId: user._id,
  });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });
  res.status(StatusCodes.OK).json({});
};

const verifyEmail = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    throw new CustomError.UnauthenticatedError("Verification failed");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification failed");
  }

  if (user.isVerified) {
    throw new CustomError.BadRequestError("Already verified");
  }

  user.compareVerificationToken(customUtils.hashString(token));

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email verified successfully" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide email");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.NotFoundError(
      `${email} does not exist, please register`
    );
  }

  user.checkPasswordTokenValidity();

  const passwordToken = customUtils.createRandomBytes();

  await customUtils.sendResetPasswordEmail({
    name: user.firstName,
    email: user.email,
    passwordToken,
    origin: customUtils.getOrigin(req),
  });

  const tenMinutes = 1000 * 60 * 10;
  const passwordTokenExpirationDate = Date.now() + tenMinutes;

  user.passwordToken = customUtils.hashString(passwordToken);
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;

  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: `Password reset link sent to ${user.email}` });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email) {
    throw new CustomError.UnauthenticatedError("Verification failed");
  }

  if (!password) {
    throw new CustomError.BadRequestError("Please provide new password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification failed");
  }

  user.verifyPasswordToken(customUtils.hashString(token));

  user.password = password;
  user.passwordToken = null;
  user.passwordTokenExpirationDate = null;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password changed successfully" });
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
