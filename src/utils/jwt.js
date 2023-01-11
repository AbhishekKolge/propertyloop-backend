const jwt = require("jsonwebtoken");

const createJWT = ({ payload, expiresIn }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
  return token;
};

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const getJWTToken = ({ user, refreshToken }) => {
  const shortExp = 1000 * 60 * 60 * 6;
  const longerExp = 1000 * 60 * 60 * 24;

  const accessTokenJWT = createJWT({
    payload: { user },
    expiresIn: `${shortExp}ms`,
  });
  const refreshTokenJWT = createJWT({
    payload: { user, refreshToken },
    expiresIn: `${longerExp}ms`,
  });

  return { accessTokenJWT, refreshTokenJWT };
};

module.exports = {
  createJWT,
  isTokenValid,
  getJWTToken,
};
