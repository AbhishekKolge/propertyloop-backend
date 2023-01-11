const CustomError = require("../errors");
const customUtils = require("../utils");

const authenticateUserMiddleware = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
  try {
    const {
      user: { userId, role },
    } = customUtils.isTokenValid(token);

    const testUser = customUtils.checkTestUser(userId);

    req.user = { userId, role, testUser };
    return next();
  } catch (err) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
};

const authorizePermissionsMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "Unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = {
  authenticateUserMiddleware,
  authorizePermissionsMiddleware,
};
