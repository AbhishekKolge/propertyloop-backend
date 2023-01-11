const express = require("express");

const {
  createJobCategory,
  getAllJobCategories,
  updateJobCategory,
  deleteJobCategory,
} = require("../controllers/jobCategoryController");

const {
  authenticateUserMiddleware,
  authorizePermissionsMiddleware,
} = require("../middleware/authentication");

const router = express.Router();

router
  .route("/")
  .post(
    [authenticateUserMiddleware, authorizePermissionsMiddleware("admin")],
    createJobCategory
  )
  .get(getAllJobCategories);
router
  .route("/:id")
  .patch(
    [authenticateUserMiddleware, authorizePermissionsMiddleware("admin")],
    updateJobCategory
  )
  .delete(
    [authenticateUserMiddleware, authorizePermissionsMiddleware("admin")],
    deleteJobCategory
  );

module.exports = router;
