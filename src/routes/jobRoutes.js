const express = require("express");

const {
  createJob,
  getAllJobs,
  getSingleJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getJob,
} = require("../controllers/jobController");

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
      authorizePermissionsMiddleware("employer"),
      testUserMiddleware,
    ],
    createJob
  )
  .get(getAllJobs);

router
  .route("/my")
  .get(
    [authenticateUserMiddleware, authorizePermissionsMiddleware("employer")],
    getMyJobs
  );

router
  .route("/my/:id")
  .get(
    [authenticateUserMiddleware, authorizePermissionsMiddleware("employer")],
    getJob
  );

router
  .route("/:id")
  .get(getSingleJob)
  .patch(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware("employer"),
      testUserMiddleware,
    ],
    updateJob
  )
  .delete(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware("employer"),
      testUserMiddleware,
    ],
    deleteJob
  );

module.exports = router;
