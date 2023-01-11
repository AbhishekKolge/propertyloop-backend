const createTokenUser = (user) => {
  return { userId: user._id, role: user.role };
};

module.exports = { createTokenUser };
