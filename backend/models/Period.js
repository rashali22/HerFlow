import mongoose from 'mongoose';

const periodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so a user cannot have two period records with the same start date
periodSchema.index({ userId: 1, startDate: 1 }, { unique: true });

export const Period = mongoose.model('Period', periodSchema);
