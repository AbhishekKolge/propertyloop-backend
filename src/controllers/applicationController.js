const { StatusCodes } = require('http-status-codes');

const Property = require('../models/Property');
const Application = require('../models/Application');
const CustomError = require('../errors');
const customUtils = require('../utils');

const createApplication = async (req, res) => {
  const {
    user: { userId },
    body: { id: propertyId },
  } = req;

  const property = await Property.findOne({ _id: propertyId }).populate({
    path: 'applications',
    select: 'tenant -property -_id',
  });

  if (!property) {
    throw new CustomError.NotFoundError(
      `No property found with id of ${propertyId}`
    );
  }

  const alreadySubmitted = property.applications.find((application) => {
    return application.tenant.equals(userId);
  });

  if (alreadySubmitted) {
    throw new CustomError.ConflictError('Already applied for this property');
  }

  await Application.create({
    tenant: userId,
    property: propertyId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Application created successfully' });
};

const getUserApplications = async (req, res) => {
  const { userId } = req.user;
  const { sort, pageNumber, pageSize } = req.query;

  const queryBuilder = new customUtils.QueryBuilder({
    model: Application,
  });

  const { results, totalCount, totalPages } = await queryBuilder
    .filter({ tenant: userId })
    .sort(sort)
    .paginate(pageNumber || 1, pageSize || 12)
    .populate('property', {
      populate: {
        path: 'landlord',
        select: { name: 1, email: 1, profileImage: 1 },
      },
    })
    .execute();

  res.status(StatusCodes.OK).json({ results, totalCount, totalPages });
};

const getPropertyApplications = async (req, res) => {
  const { id: propertyId } = req.params;
  const { sort, pageNumber, pageSize } = req.query;

  const queryBuilder = new customUtils.QueryBuilder({
    model: Application,
  });

  const { results, totalCount, totalPages } = await queryBuilder
    .filter({ property: propertyId })
    .sort(sort)
    .paginate(pageNumber || 1, pageSize || 12)
    .populate('tenant', { name: 1, email: 1, profileImage: 1 })
    .execute();

  res.status(StatusCodes.OK).json({ results, totalCount, totalPages });
};

const cancelApplication = async (req, res) => {
  const {
    params: { id: applicationId },
    user: { userId },
  } = req;

  const { deletedCount } = await Application.deleteOne({
    _id: applicationId,
    tenant: userId,
  });

  if (!deletedCount) {
    throw new CustomError.NotFoundError(
      `No application found with id of ${applicationId}`
    );
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Application cancelled successfully' });
};

module.exports = {
  createApplication,
  getUserApplications,
  getPropertyApplications,
  cancelApplication,
};
