const { StatusCodes } = require("http-status-codes");

const Job = require("../models/Job");
const Application = require("../models/Application");
const CustomError = require("../errors");

const createApplication = async (req, res) => {
  const {
    user: { userId },
    body: { id: jobId },
  } = req;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new CustomError.NotFoundError(`No job found with id of ${jobId}`);
  }

  const alreadySubmitted = await Application.findOne({
    job: jobId,
    user: userId,
  });

  if (alreadySubmitted) {
    throw new CustomError.ConflictError("Already applied for this job");
  }

  await Application.create({
    user: userId,
    job: jobId,
  });

  res.status(StatusCodes.CREATED).json({});
};

const getUserApplications = async (req, res) => {
  const { userId } = req.user;
  const { status, sort } = req.query;

  let queryObject = {
    user: userId,
  };

  if (status) {
    queryObject.status = status;
  }

  let result = Application.find(queryObject).populate({
    path: "job",
    populate: [
      {
        path: "employer",
        select: "companyName profileImage gender",
      },
      { path: "jobCategory", select: "name" },
    ],
  });

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (!sort) {
    result = result.sort("-createdAt");
  }

  const page = +req.query.page || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const applications = await result;

  const totalApplications = await Application.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalApplications / limit);

  res
    .status(StatusCodes.OK)
    .json({ applications, totalApplications, numOfPages });
};

const getJobApplications = async (req, res) => {
  const { id: jobId } = req.params;
  const { status, sort } = req.query;

  let queryObject = {
    job: jobId,
  };

  if (status) {
    queryObject.status = status;
  }

  let result = Application.find(queryObject).populate({
    path: "user",
    select:
      "-password -authenticationPlatform -verificationToken -isVerified -verified -passwordToken -passwordTokenExpirationDate",
    populate: { path: "jobCategories", select: "name" },
  });

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (!sort) {
    result = result.sort("-createdAt");
  }

  const page = +req.query.page || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const applications = await result;

  const totalApplications = await Application.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalApplications / limit);

  res
    .status(StatusCodes.OK)
    .json({ applications, totalApplications, numOfPages });
};

const updateApplication = async (req, res) => {
  const {
    params: { id: applicationId },
    body: { status },
  } = req;

  if (!status) {
    throw new CustomError.BadRequestError("Please provide status");
  }

  const application = await Application.findOne({ _id: applicationId });

  if (!application) {
    throw new CustomError.NotFoundError(
      `No application found with id of ${applicationId}`
    );
  }

  await application.checkPermission(req.user);

  application.status = status;
  await application.save();

  res.status(StatusCodes.OK).json({});
};

module.exports = {
  createApplication,
  getUserApplications,
  getJobApplications,
  updateApplication,
};
