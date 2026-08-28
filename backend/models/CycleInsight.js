import mongoose from 'mongoose';

const cycleInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    avgCycleLength: {
      type: Number,
      default: null,
    },
    avgPeriodLength: {
      type: Number,
      default: null,
    },
    nextPeriodDate: {
      type: Date,
      default: null,
    },
    totalPeriods: {
      type: Number,
      default: 0,
    },
    lastPeriodReminderSent: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const CycleInsight = mongoose.model('CycleInsight', cycleInsightSchema);
