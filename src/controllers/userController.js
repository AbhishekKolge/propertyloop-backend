const { StatusCodes } = require("http-status-codes");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

const User = require("../models/User");
const JobCategory = require("../models/JobCategory");
const CustomError = require("../errors");
const customUtils = require("../utils");

const showCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId }).select(
    "-password -authenticationPlatform -verificationToken -isVerified -verified -passwordToken -passwordTokenExpirationDate"
  );
  const jobCategories = await JobCategory.find({});
  res.status(StatusCodes.OK).json({ user, jobCategories });
};

const uploadProfileImage = async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new CustomError.BadRequestError("No file uploaded");
  }

  const profileImage = req.files.image;

  if (!profileImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload an image");
  }

  const maxSize = 1024 * 1024;

  if (profileImage.size >= maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload an image smaller than 1 MB"
    );
  }

  const result = await cloudinary.uploader.upload(profileImage.tempFilePath, {
    use_filename: true,
    folder: "joblink/profile-images",
  });

  await fs.unlink(profileImage.tempFilePath);

  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { profileImage: result.secure_url, profileImageId: result.public_id },
    { runValidators: true }
  );

  if (user.profileImageId) {
    await cloudinary.uploader.destroy(user.profileImageId);
  }

  res.status(StatusCodes.OK).json({
    profileImage: { src: result.secure_url },
  });
};

const uploadResume = async (req, res) => {
  if (!req.files || !req.files.resume) {
    throw new CustomError.BadRequestError("No file uploaded");
  }

  const userResume = req.files.resume;

  if (!userResume.mimetype.startsWith("application/pdf")) {
    throw new CustomError.BadRequestError("Please upload a pdf");
  }

  const maxSize = 1024 * 1024;

  if (userResume.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload a file smaller than 1 MB"
    );
  }

  const result = await cloudinary.uploader.upload(userResume.tempFilePath, {
    use_filename: true,
    folder: "joblink/resume",
  });

  await fs.unlink(userResume.tempFilePath);

  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { resume: result.secure_url, resumeId: result.public_id },
    { runValidators: true }
  );

  if (user.resumeId) {
    await cloudinary.uploader.destroy(user.resumeId);
  }

  res.status(StatusCodes.OK).json({
    resume: { src: result.secure_url },
  });
};

const updateUser = async (req, res) => {
  const { firstName, companyName } = req.body;
  const { userId, role } = req.user;

  if (!firstName) {
    throw new CustomError.BadRequestError("Please provide first name");
  }

  if (role === "employer" && !companyName) {
    throw new CustomError.BadRequestError("Please provide company name");
  }

  if (role !== "employer") {
    delete req.body.companyName;
  }

  delete req.body.email;

  await User.findOneAndUpdate({ _id: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({});
};

const removeFile = async (req, res) => {
  const { isResume, fileId } = req.query;

  if (!fileId) {
    throw new CustomError.BadRequestError("Please provide file id");
  }

  let fileType = "profileImageId";
  let fileProperty = "profileImage";

  if (isResume == 1) {
    fileType = "resumeId";
    fileProperty = "resume";
  }

  const user = await User.findOne({ [fileType]: fileId });

  if (!user) {
    throw new CustomError.NotFoundError(`No file found with id of ${fileId}`);
  }

  customUtils.checkPermissions(req.user, user._id);

  user[fileType] = "";
  user[fileProperty] = "";
  await user.save();

  await cloudinary.uploader.destroy(fileId);

  res.status(StatusCodes.OK).json({});
};

const deleteUser = async (req, res) => {
  const { userId } = req.user;

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new CustomError.NotFoundError(`No user found with id of ${userId}`);
  }

  customUtils.checkPermissions(req.user, user._id);

  await user.remove();

  res.status(StatusCodes.OK).json({});
};

module.exports = {
  showCurrentUser,
  uploadProfileImage,
  uploadResume,
  updateUser,
  removeFile,
  deleteUser,
};
