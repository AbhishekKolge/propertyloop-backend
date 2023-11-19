const CustomError = require('../errors');
const customUtils = require('../utils');

const authenticateUserMiddleware = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }

  try {
    const { userId, role } = customUtils.isTokenValid(token);
    const testUser = customUtils.checkTestUser(userId);
    req.user = { userId, role, testUser };
    return next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

const authorizePermissionsMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

const attachUserIfExists = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    return next();
  }

  try {
    const { userId, role } = customUtils.isTokenValid(token);
    const testUser = customUtils.checkTestUser(userId);
    req.user = { userId, role, testUser };
    return next();
  } catch (err) {
    return next();
  }
};

module.exports = {
  authenticateUserMiddleware,
  authorizePermissionsMiddleware,
  attachUserIfExists,
};
