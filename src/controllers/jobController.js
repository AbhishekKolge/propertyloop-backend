const { StatusCodes } = require("http-status-codes");

const Job = require("../models/Job");
const JobCategory = require("../models/JobCategory");
const CustomError = require("../errors");
const customUtils = require("../utils");

const createJob = async (req, res) => {
  const { jobCategory: jobCategoryId } = req.body;
  const { userId } = req.user;

  const isValidJobCategory = await JobCategory.findOne({
    _id: jobCategoryId,
  });

  if (!isValidJobCategory) {
    throw new CustomError.BadRequestError(
      `No category found with id of ${jobCategoryId}`
    );
  }

  req.body.employer = userId;
  await Job.create(req.body);

  res.status(StatusCodes.CREATED).json({});
};

const getAllJobs = async (req, res) => {
  const { search, type, status, category, sort } = req.query;

  let queryObject = {};

  if (search) {
    queryObject.title = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (status) {
    queryObject.status = status;
  }

  if (type) {
    queryObject.type = type;
  }

  if (category) {
    queryObject.jobCategory = category;
  }

  let result = Job.find(queryObject)
    .populate({
      path: "employer",
      select: "companyName profileImage gender",
    })
    .populate({
      path: "jobCategory",
      select: "name",
    });

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.collation({ locale: "en" }).sort("title");
  }
  if (sort === "z-a") {
    result = result.collation({ locale: "en" }).sort("-title");
  }
  if (!sort) {
    result = result.sort("-createdAt");
  }

  const page = +req.query.page || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const getSingleJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId })
    .populate({
      path: "employer",
      select: "companyName profileImage gender contactNo",
    })
    .populate({
      path: "jobCategory",
      select: "name",
    })
    .populate({
      path: "applications",
      select: "user",
    });

  if (!job) {
    throw new CustomError.NotFoundError(`No job found with id of ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const getMyJobs = async (req, res) => {
  const { search, type, status, category, sort } = req.query;
  const { userId } = req.user;

  let queryObject = {
    employer: userId,
  };

  if (search) {
    queryObject.title = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (status) {
    queryObject.status = status;
  }

  if (type) {
    queryObject.type = type;
  }

  if (category) {
    queryObject.jobCategory = category;
  }

  let result = Job.find(queryObject)
    .populate({
      path: "employer",
      select: "companyName profileImage gender",
    })
    .populate({
      path: "jobCategory",
      select: "name",
    });

  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.collation({ locale: "en" }).sort("title");
  }
  if (sort === "z-a") {
    result = result.collation({ locale: "en" }).sort("-title");
  }
  if (!sort) {
    result = result.sort("-createdAt");
  }

  const page = +req.query.page || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const updateJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new CustomError.NotFoundError(`No job found with id of ${jobId}`);
  }

  customUtils.checkPermissions(req.user, job.employer);

  for (const key in req.body) {
    job[key] = req.body[key];
  }
  await job.save();

  res.status(StatusCodes.OK).json({});
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new CustomError.NotFoundError(`No job found with id of ${jobId}`);
  }

  customUtils.checkPermissions(req.user, job.employer);

  await job.remove();

  res.status(StatusCodes.OK).json({});
};

const getJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId }).populate({
    path: "jobCategory",
    select: "id",
  });

  if (!job) {
    throw new CustomError.NotFoundError(`No job found with id of ${jobId}`);
  }

  customUtils.checkPermissions(req.user, job.employer);

  res.status(StatusCodes.OK).json({ job });
};

module.exports = {
  createJob,
  getAllJobs,
  getSingleJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getJob,
};
