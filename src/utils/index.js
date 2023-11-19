const {
  hashString,
  createRandomBytes,
  createRandomOtp,
} = require('./createHash');
const { createTokenUser } = require('./createTokenUser');
const { nodeMailerConfig } = require('./emailConfig');
const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const { checkPermissions } = require('./permissions');
const { getUserAgent, getRequestIp, checkTestUser } = require('./requestInfo');
const { sendEmail } = require('./email');
const {
  sendResetPasswordEmail,
  sendVerificationEmail,
} = require('./sendEmail');
const { currentTime, checkTimeExpired, time } = require('./time');
const { removeQuotes } = require('./format');
const { QueryBuilder } = require('./queryBuilder');

module.exports = {
  hashString,
  createRandomBytes,
  createRandomOtp,
  createTokenUser,
  nodeMailerConfig,
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  checkPermissions,
  getUserAgent,
  getRequestIp,
  checkTestUser,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  currentTime,
  checkTimeExpired,
  time,
  removeQuotes,
  QueryBuilder,
};
