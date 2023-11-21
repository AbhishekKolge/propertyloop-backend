const { StatusCodes } = require('http-status-codes');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

const User = require('../models/User');
const CustomError = require('../errors');
const customUtils = require('../utils');

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select(
    '-password -authenticationPlatform -verificationCode -passwordCode -passwordCodeExpirationDate'
  );

  res.status(StatusCodes.OK).json({ user });
};

const uploadProfileImage = async (req, res) => {
  const { userId } = req.user;

  if (!req.files || !req.files.profileImage) {
    throw new CustomError.BadRequestError('No file attached');
  }

  const { profileImage } = req.files;

  if (!profileImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please upload an image');
  }

  const maxSize = 1024 * 1024;

  if (profileImage.size >= maxSize) {
    throw new CustomError.BadRequestError(
      'Please upload an image smaller than 1 MB'
    );
  }

  const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
    use_filename: true,
    folder: 'propertyloop/profile-images',
  });

  await fs.unlink(profileImage.tempFilePath);

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { profileImage: result.secure_url, profileImageId: result.public_id },
    { runValidators: true }
  );

  if (user.profileImageId) {
    await cloudinary.uploader.destroy(user.profileImageId);
  }

  res.status(StatusCodes.OK).json({
    profileImage: result.secure_url,
  });
};

const updateUser = async (req, res) => {
  const { userId } = req.user;

  await User.findOneAndUpdate({ _id: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    msg: 'Profile updated successfully',
  });
};

const removeProfileImage = async (req, res) => {
  const { profileImageId } = req.query;
  const { userId } = req.user;

  if (!profileImageId) {
    throw new CustomError.BadRequestError('Please provide profile image id');
  }

  const user = await User.findOne({ profileImageId, _id: userId });

  if (!user) {
    throw new CustomError.NotFoundError(
      `No profile image found with id of ${fileId}`
    );
  }

  user.profileImage = '';
  user.profileImageId = '';
  await user.save();

  await cloudinary.uploader.destroy(profileImageId);

  res.status(StatusCodes.OK).json({
    msg: 'Profile image removed successfully',
  });
};

const deleteUser = async (req, res) => {
  const { userId } = req.user;

  const { deletedCount } = await User.deleteOne({
    _id: userId,
  });

  if (!deletedCount) {
    throw new CustomError.NotFoundError(`No user found with id of ${userId}`);
  }

  res.cookie('token', 'logout', {
    httpOnly: true,
    maxAge: 0,
    secure: true,
    signed: true,
    sameSite: 'none',
  });

  res.status(StatusCodes.OK).json({
    msg: 'Account deleted successfully',
  });
};

module.exports = {
  showCurrentUser,
  uploadProfileImage,
  removeProfileImage,
  deleteUser,
  updateUser,
};
