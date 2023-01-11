const express = require("express");

const {
  createApplication,
  getUserApplications,
  getJobApplications,
  updateApplication,
} = require("../controllers/applicationController");

const {
  authenticateUserMiddleware,
  authorizePermissionsMiddleware,
} = require("../middleware/authentication");
const { testUserMiddleware } = require("../middleware/test-user");

const router = express.Router();

router
  .route("/")
  .post(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware("user"),
      testUserMiddleware,
    ],
    createApplication
  )
  .get(
    [authenticateUserMiddleware, authorizePermissionsMiddleware("user")],
    getUserApplications
  );

router
  .route("/:id")
  .get(
    [authenticateUserMiddleware, authorizePermissionsMiddleware("employer")],
    getJobApplications
  )
  .patch(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware("employer"),
      testUserMiddleware,
    ],
    updateApplication
  );

module.exports = router;
