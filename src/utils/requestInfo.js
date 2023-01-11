const getOrigin = (req) => {
  const host = req.get("x-forwarded-host");
  const protocol = req.get("x-forwarded-proto");
  return `${protocol}://${host}`;
};

const getUserAgent = (req) => {
  return req.headers["user-agent"];
};

const getRequestIp = (req) => {
  return req.ip;
};

const checkTestUser = (userId) => {
  const isTestUser =
    userId === process.env.TEST_USER_ID ||
    userId === process.env.TEST_EMPLOYER_ID;

  return isTestUser;
};

module.exports = { getOrigin, getUserAgent, getRequestIp, checkTestUser };
