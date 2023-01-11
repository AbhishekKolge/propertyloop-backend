const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

const CustomError = require("../errors");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "Please provide first name"],
      minLength: [3, "First name should be minimum 3 characters"],
      maxLength: [20, "First name should not be more than 20 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: [20, "Last name should not be more than 20 characters"],
    },
    designation: {
      type: String,
      trim: true,
      maxLength: [40, "Designation should not be more than 40 characters"],
    },
    contactNo: {
      type: String,
      trim: true,
      validate: {
        validator: validator.isMobilePhone,
        message: "Please provide valid contact no",
      },
    },
    dob: {
      type: Date,
    },
    city: {
      type: String,
      trim: true,
      maxLength: [20, "City should not be more than 20 characters"],
    },
    profileImage: {
      type: String,
    },
    profileImageId: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "{VALUE} is not supported",
      },
      default: "active",
    },
    companyName: {
      type: String,
      maxLength: [40, "City should not be more than 40 characters"],
    },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide valid email",
      },
      required: [true, "Please provide email"],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Please provide password"],
      minLength: [8, "Password should be at least 8 characters"],
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female"],
        message: "{VALUE} is not supported",
      },
      default: "male",
    },
    role: {
      type: String,
      enum: {
        values: ["employer", "user", "admin"],
        message: "{VALUE} is not supported",
      },
      default: "user",
    },
    resume: {
      type: String,
    },
    resumeId: {
      type: String,
    },
    authenticationPlatform: {
      type: String,
      enum: {
        values: ["app", "google"],
        message: "{VALUE} is not supported",
      },
      default: "app",
    },
    verificationToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Date,
    },
    passwordToken: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    jobCategories: [
      {
        type: mongoose.Types.ObjectId,
        ref: "JobCategory",
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ contactNo: 1, email: 1 }, { unique: true });

UserSchema.pre("validate", async function () {
  const isModified = this.isModified("password");
  if (!isModified) return;
  if (
    !validator.isStrongPassword(this.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  )
    throw new CustomError.BadRequestError("Please provide strong password");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre("remove", async function () {
  await this.model("Token").findOneAndDelete({ user: this._id });
  await this.model("Application").deleteMany({ user: this._id });
  const jobs = await this.model("Job").find({ employer: this._id });
  for (let i = 0; i < jobs.length; i++) {
    await jobs[i].remove();
  }
  if (this.profileImageId) {
    await cloudinary.uploader.destroy(this.profileImageId);
  }
  if (this.resumeId) {
    await cloudinary.uploader.destroy(this.resumeId);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  if (!isMatch)
    throw new CustomError.UnauthenticatedError(
      "Please provide valid credentials"
    );
};

UserSchema.methods.compareVerificationToken = function (token) {
  const isMatch = this.verificationToken === token;
  if (!isMatch)
    throw new CustomError.UnauthenticatedError("Verification failed");
};

UserSchema.methods.checkPasswordTokenValidity = function () {
  const isValid =
    new Date(this.passwordTokenExpirationDate).getTime() > Date.now();

  if (isValid && this.passwordToken)
    throw new CustomError.ConflictError("Password reset link already sent");
};

UserSchema.methods.verifyPasswordToken = function (passwordToken) {
  const isValid =
    new Date(this.passwordTokenExpirationDate).getTime() > Date.now();

  if (!isValid)
    throw new CustomError.UnauthenticatedError(
      "Password reset link has expired"
    );

  const isMatch = this.passwordToken === passwordToken;
  if (!isMatch)
    throw new CustomError.UnauthenticatedError("Verification failed");
};

module.exports = mongoose.model("User", UserSchema);
