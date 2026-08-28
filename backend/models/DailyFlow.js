import mongoose from 'mongoose';

const dailyFlowSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    intensity: {
      type: Number,
      required: true,
      min: 0,
      max: 3, // 0 = None, 1 = Light, 2 = Medium, 3 = Heavy
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so a user cannot have two flow entries for the same date
dailyFlowSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyFlow = mongoose.model('DailyFlow', dailyFlowSchema);
