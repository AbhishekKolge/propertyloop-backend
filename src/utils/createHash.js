const crypto = require("crypto");

const createRandomBytes = (count = 40) => {
  return crypto.randomBytes(count).toString("hex");
};

const hashString = (string) => {
  return crypto.createHash("md5").update(string).digest("hex");
};

module.exports = { hashString, createRandomBytes };
