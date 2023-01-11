const express = require("express");

const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { authenticateUserMiddleware } = require("../middleware/authentication");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").delete(authenticateUserMiddleware, logout);
router.route("/verify-email").post(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

module.exports = router;
