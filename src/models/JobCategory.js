const mongoose = require("mongoose");

const CustomError = require("../errors");

const JobCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      minLength: [3, "Category name should be minimum 3 characters"],
      maxLength: [40, "Category name should not be more than 40 characters"],
      unique: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

JobCategorySchema.virtual("users", {
  ref: "Users",
  localField: "_id",
  foreignField: "jobCategories",
  justOne: false,
});

JobCategorySchema.pre("remove", async function () {
  await this.model("User").updateMany({ $pull: { jobCategories: this._id } });

  const jobs = await this.model("Job").find({ jobCategory: this._id });

  for (let i = 0; i < jobs.length; i++) {
    await jobs[i].remove();
  }
});

JobCategorySchema.statics.checkDuplicate = async function (categoryName) {
  const result = await this.aggregate([{ $match: { name: categoryName } }]);

  if (result.length) {
    throw new CustomError.ConflictError("Category already exists");
  }
};

JobCategorySchema.pre("validate", async function () {
  await this.constructor.checkDuplicate(this.name);
});

module.exports = mongoose.model("JobCategory", JobCategorySchema);
