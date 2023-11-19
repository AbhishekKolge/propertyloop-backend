const express = require('express');

const {
  showCurrentUser,
  uploadProfileImage,
  removeProfileImage,
  deleteUser,
  updateUser,
} = require('../controllers/userController');
const {
  updateUserSchema,
  uploadProfileImageSchema,
  removeProfileImageSchema,
  deleteUserSchema,
} = require('../validation/user');
const { authenticateUserMiddleware } = require('../middleware/authentication');
const { testUserMiddleware } = require('../middleware/test-user');
const { validateRequest } = require('../middleware/validate-request');

const router = express.Router();

router
  .route('/')
  .patch(
    [authenticateUserMiddleware, updateUserSchema, validateRequest],
    updateUser
  )
  .delete(
    [
      authenticateUserMiddleware,
      deleteUserSchema,
      validateRequest,
      testUserMiddleware,
    ],
    deleteUser
  );
router.route('/show-me').get(authenticateUserMiddleware, showCurrentUser);
router
  .route('/profile-image')
  .post(
    [authenticateUserMiddleware, uploadProfileImageSchema, validateRequest],
    uploadProfileImage
  )
  .delete(
    [authenticateUserMiddleware, removeProfileImageSchema, validateRequest],
    removeProfileImage
  );

module.exports = router;
