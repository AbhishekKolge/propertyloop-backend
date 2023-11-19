const express = require('express');

const {
  createApplication,
  getUserApplications,
  getPropertyApplications,
  cancelApplication,
} = require('../controllers/applicationController');
const {
  authenticateUserMiddleware,
  authorizePermissionsMiddleware,
} = require('../middleware/authentication');
const {
  createApplicationSchema,
  cancelApplicationSchema,
} = require('../validation/application');
const { testUserMiddleware } = require('../middleware/test-user');
const { validateRequest } = require('../middleware/validate-request');

const router = express.Router();

router
  .route('/')
  .post(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware('tenant'),
      createApplicationSchema,
      validateRequest,
    ],
    createApplication
  )
  .get(
    [authenticateUserMiddleware, authorizePermissionsMiddleware('tenant')],
    getUserApplications
  );

router
  .route('/:id')
  .get(
    [authenticateUserMiddleware, authorizePermissionsMiddleware('landlord')],
    getPropertyApplications
  )
  .delete(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware('tenant'),
      cancelApplicationSchema,
      validateRequest,
    ],
    cancelApplication
  );

module.exports = router;
