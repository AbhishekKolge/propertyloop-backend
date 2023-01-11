const express = require("express");

const {
  showCurrentUser,
  uploadProfileImage,
  uploadResume,
  updateUser,
  removeFile,
  deleteUser,
} = require("../controllers/userController");

const { authenticateUserMiddleware } = require("../middleware/authentication");
const { testUserMiddleware } = require("../middleware/test-user");

const router = express.Router();

router
  .route("/")
  .patch([authenticateUserMiddleware, testUserMiddleware], updateUser)
  .delete([authenticateUserMiddleware, testUserMiddleware], deleteUser);
router.route("/show-me").get(authenticateUserMiddleware, showCurrentUser);
router
  .route("/profile-image")
  .post([authenticateUserMiddleware, testUserMiddleware], uploadProfileImage);
router
  .route("/resume")
  .post([authenticateUserMiddleware, testUserMiddleware], uploadResume);
router
  .route("/file")
  .delete([authenticateUserMiddleware, testUserMiddleware], removeFile);

module.exports = router;
