const { createJWT, isTokenValid, getJWTToken } = require("./jwt");
const { createTokenUser } = require("./createTokenUser");
const { checkPermissions } = require("./checkPermissions");
const { nodeMailerConfig } = require("./emailConfig");
const { sendEmail } = require("./sendEmail");
const { sendVerificationEmail } = require("./sendVerificationEmail");
const { sendResetPasswordEmail } = require("./sendResetPasswordEmail");
const { hashString, createRandomBytes } = require("./createHash");
const {
  getOrigin,
  getUserAgent,
  getRequestIp,
  checkTestUser,
} = require("./requestInfo");

module.exports = {
  createJWT,
  isTokenValid,
  getJWTToken,
  createTokenUser,
  checkPermissions,
  nodeMailerConfig,
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  hashString,
  createRandomBytes,
  getOrigin,
  getUserAgent,
  getRequestIp,
  checkTestUser,
};
