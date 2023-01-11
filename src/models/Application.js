const mongoose = require("mongoose");

const customUtils = require("../utils");
const CustomError = require("../errors");

const ApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "interview", "selected", "declined"],
        message: "{VALUE} is not supported",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ user: 1, job: 1 }, { unique: true });

ApplicationSchema.methods.checkPermission = async function (user) {
  const job = await this.model("Job").findOne({ _id: this.job });

  if (!job) {
    throw new CustomError.NotFoundError(
      `No job found for application with id of ${this._id}`
    );
  }

  customUtils.checkPermissions(user, job.employer);
};

module.exports = mongoose.model("Application", ApplicationSchema);
