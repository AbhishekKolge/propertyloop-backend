const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const Application = require('./Application');

const PropertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide name'],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Please provide description'],
    },
    location: {
      type: String,
      trim: true,
      required: [true, 'Please provide location'],
    },
    propertyImage: {
      type: String,
    },
    propertyImageId: {
      type: String,
    },
    furnishStatus: {
      type: String,
      enum: {
        values: ['unfurnished', 'furnished'],
        message: '{VALUE} is not supported',
      },
      default: 'unfurnished',
    },
    carpetArea: {
      type: Number,
    },
    price: {
      type: Number,
    },
    landlord: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'closed'],
        message: '{VALUE} is not supported',
      },
      default: 'open',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PropertySchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'property',
  justOne: false,
});

PropertySchema.pre('deleteOne', async function () {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (!docToDelete) {
    return;
  }
  await Application.deleteMany({ property: docToDelete._id });
  if (docToDelete.propertyImageId) {
    await cloudinary.uploader.destroy(docToDelete.propertyImageId);
  }
});

module.exports = mongoose.model('Property', PropertySchema);
