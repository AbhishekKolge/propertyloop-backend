const { StatusCodes } = require("http-status-codes");

const JobCategory = require("../models/JobCategory");
const CustomError = require("../errors");
const customUtils = require("../utils");

const createJobCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new CustomError.BadRequestError("Please provide category name");
  }

  const jobCategory = await JobCategory.create({ name });

  res.status(StatusCodes.CREATED).json({ jobCategory });
};

const getAllJobCategories = async (req, res) => {
  const jobCategories = await JobCategory.find({});

  res
    .status(StatusCodes.OK)
    .json({ jobCategories, count: jobCategories.length });
};

const updateJobCategory = async (req, res) => {
  const { id: jobCategoryId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new CustomError.BadRequestError("Please provide category name");
  }

  const jobCategory = await JobCategory.findOne({ _id: jobCategoryId });

  if (!jobCategory) {
    throw new CustomError.NotFoundError(
      `No job category found with id of ${jobCategoryId}`
    );
  }

  jobCategory.name = name;
  await jobCategory.save();

  res.status(StatusCodes.OK).json({ jobCategory });
};

const deleteJobCategory = async (req, res) => {
  const { id: jobCategoryId } = req.params;

  const jobCategory = await JobCategory.findOne({ _id: jobCategoryId });

  if (!jobCategory) {
    throw new CustomError.NotFoundError(
      `No job category found with id of ${jobCategoryId}`
    );
  }

  await jobCategory.remove();

  res.status(StatusCodes.OK).json({});
};

module.exports = {
  createJobCategory,
  getAllJobCategories,
  updateJobCategory,
  deleteJobCategory,
};
