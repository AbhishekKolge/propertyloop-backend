const express = require('express');

const {
  createProperty,
  getAllProperties,
  getSingleProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const {
  createPropertySchema,
  updatePropertySchema,
  deletePropertySchema,
} = require('../validation/property');
const {
  authenticateUserMiddleware,
  authorizePermissionsMiddleware,
  attachUserIfExists,
} = require('../middleware/authentication');
const { testUserMiddleware } = require('../middleware/test-user');
const { validateRequest } = require('../middleware/validate-request');

const router = express.Router();

router
  .route('/')
  .post(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware('landlord'),
      createPropertySchema,
      validateRequest,
    ],
    createProperty
  )
  .get(attachUserIfExists, getAllProperties);

router
  .route('/my')
  .get(
    [authenticateUserMiddleware, authorizePermissionsMiddleware('landlord')],
    getMyProperties
  );

router
  .route('/:id')
  .get(attachUserIfExists, getSingleProperty)
  .patch(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware('landlord'),
      updatePropertySchema,
      validateRequest,
    ],
    updateProperty
  )
  .delete(
    [
      authenticateUserMiddleware,
      authorizePermissionsMiddleware('landlord'),
      deletePropertySchema,
      validateRequest,
    ],
    deleteProperty
  );

module.exports = router;
