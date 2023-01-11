const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minLength: [3, "title should be minimum 3 characters"],
      maxLength: [40, "title should not be more than 40 characters"],
    },
    location: {
      type: String,
      trim: true,
      required: true,
      minLength: [3, "location should be minimum 3 characters"],
      maxLength: [40, "location should not be more than 40 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["full-time", "part-time", "contract", "internship"],
        message: "{VALUE} is not supported",
      },
      default: "full-time",
    },
    description: {
      type: String,
    },
    minSalary: {
      type: Number,
      default: 0,
    },
    maxSalary: {
      type: Number,
      default: 0,
    },
    employer: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["open", "closed"],
        message: "{VALUE} is not supported",
      },
      default: "open",
    },
    jobCategory: {
      type: mongoose.Types.ObjectId,
      ref: "JobCategory",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

JobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "job",
  justOne: false,
});

JobSchema.pre("remove", async function () {
  await this.model("Application").deleteMany({ job: this._id });
});

module.exports = mongoose.model("Job", JobSchema);
