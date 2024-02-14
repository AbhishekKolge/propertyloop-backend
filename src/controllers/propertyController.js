const { StatusCodes } = require('http-status-codes');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

const Property = require('../models/Property');
const CustomError = require('../errors');
const customUtils = require('../utils');

const createProperty = async (req, res) => {
  const { userId } = req.user;

  if (!req.files || !req.files.propertyImage) {
    throw new CustomError.BadRequestError('Please upload property image');
  }

  const { propertyImage } = req.files;

  try {
    if (!propertyImage.mimetype.startsWith('image')) {
      throw new CustomError.BadRequestError('Please upload an image');
    }

    const maxSize = 1024 * 1024;

    if (propertyImage.size >= maxSize) {
      throw new CustomError.BadRequestError(
        'Please upload image smaller than 1 MB'
      );
    }

    const result = await cloudinary.uploader.upload(
      propertyImage.tempFilePath,
      {
        use_filename: true,
        folder: `${process.env.APP_NAME.split(' ').join('-')}/profile-images`,
      }
    );

    await fs.unlink(propertyImage.tempFilePath);

    req.body.propertyImage = result.secure_url;
    req.body.propertyImageId = result.public_id;
    req.body.landlord = userId;

    await Property.create(req.body);

    res.status(StatusCodes.CREATED).json({
      msg: 'Property created successfully',
    });
  } catch (error) {
    await fs.unlink(propertyImage.tempFilePath);
    throw error;
  }
};

const getAllProperties = async (req, res) => {
  const { search, furnishStatus, status, sort, pageNumber, pageSize } =
    req.query;

  const queryBuilder = new customUtils.QueryBuilder({
    model: Property,
    searchFields: ['name', 'location'],
    sortKey: 'price',
  });

  const { results, totalCount, totalPages } = await queryBuilder
    .filter({ furnishStatus, search, status })
    .sort(sort)
    .paginate(pageNumber || 1, pageSize || 12)
    .populate('landlord', 'name email profileImage')
    .populate('applications', 'tenant -property -_id')
    .execute();

  res.status(StatusCodes.OK).json({ results, totalCount, totalPages });
};

const getSingleProperty = async (req, res) => {
  const { id: propertyId } = req.params;

  const property = await Property.findOne({ _id: propertyId })
    .populate({
      path: 'landlord',
      select: 'name email profileImage',
    })
    .populate({
      path: 'applications',
      select: 'tenant -property -_id',
    })
    .lean();

  if (!property) {
    throw new CustomError.NotFoundError(
      `No property found with id of ${propertyId}`
    );
  }

  const ownProperty = property.landlord._id.equals(req?.user?.userId);

  property.owned = !!ownProperty;

  const isApplicationSubmitted = property.applications.find((application) => {
    return application.tenant.equals(req?.user?.userId);
  });

  property.isApplicationSubmitted = !!isApplicationSubmitted;

  res.status(StatusCodes.OK).json({ property });
};

const getMyProperties = async (req, res) => {
  const { search, furnishStatus, status, sort, pageNumber, pageSize } =
    req.query;
  const { userId } = req.user;

  const queryBuilder = new customUtils.QueryBuilder({
    model: Property,
    searchFields: ['name', 'location'],
    sortKey: 'price',
  });

  const { results, totalCount, totalPages } = await queryBuilder
    .filter({ furnishStatus, search, status, landlord: userId })
    .sort(sort)
    .paginate(pageNumber || 1, pageSize || 12)
    .populate('landlord', 'name email profileImage')
    .populate('applications', 'tenant -property -_id')
    .execute();

  res.status(StatusCodes.OK).json({ results, totalCount, totalPages });
};

const updateProperty = async (req, res) => {
  const {
    params: { id: propertyId },
    user: { userId },
  } = req;

  const propertyImage = req?.files?.propertyImage;

  try {
    const property = await Property.findOne({
      _id: propertyId,
      landlord: userId,
    });

    if (!property) {
      throw new CustomError.NotFoundError(
        `No property found with id of ${propertyId}`
      );
    }

    if (propertyImage) {
      if (!propertyImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError('Please upload an image');
      }

      const maxSize = 1024 * 1024;

      if (propertyImage.size >= maxSize) {
        throw new CustomError.BadRequestError(
          'Please upload image smaller than 1 MB'
        );
      }

      const result = await cloudinary.uploader.upload(
        propertyImage.tempFilePath,
        {
          use_filename: true,
          folder: `${process.env.APP_NAME.split(' ').join('-')}/profile-images`,
        }
      );

      await fs.unlink(propertyImage.tempFilePath);

      req.body.propertyImage = result.secure_url;
      req.body.propertyImageId = result.public_id;
    }

    const oldPropertyImageId = property.propertyImageId;

    for (const key in req.body) {
      property[key] = req.body[key];
    }

    if (propertyImage && oldPropertyImageId) {
      await cloudinary.uploader.destroy(oldPropertyImageId);
    }

    await property.save();

    res.status(StatusCodes.OK).json({
      msg: 'Property updated successfully',
    });
  } catch (error) {
    propertyImage && (await fs.unlink(propertyImage.tempFilePath));
    throw error;
  }
};

const deleteProperty = async (req, res) => {
  const {
    params: { id: propertyId },
    user: { userId },
  } = req;

  const { deletedCount } = await Property.deleteOne({
    _id: propertyId,
    landlord: userId,
  });

  if (!deletedCount) {
    throw new CustomError.NotFoundError(
      `No property found with id of ${propertyId}`
    );
  }

  res.status(StatusCodes.OK).json({ msg: 'Property deleted successfully' });
};

module.exports = {
  createProperty,
  getAllProperties,
  getSingleProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
