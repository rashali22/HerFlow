import { CycleInsight } from '../models/CycleInsight.js';
import { Period } from '../models/Period.js';
import {
  getLastPeriod,
  getAverageCycleLength,
  getNextPeriodDate,
  getDaysUntilNextPeriod,
  isFertileToday,
} from '../services/cycleService.js';

// @desc    Get next period prediction and fertility status
// @route   GET /api/predictions/next-period
// @access  Private
export const getNextPeriodPrediction = async (req, res) => {
  try {
    const periods = await Period.find({ userId: req.user._id }).sort({ startDate: 1 });

    if (!periods || periods.length === 0) {
      return res.status(200).json({
        predictedDate: null,
        daysUntilNext: null,
        status: 'Insufficient data. Please log at least 2 period cycles.',
        isFertile: null,
      });
    }

    const avgCycleLength = getAverageCycleLength(periods) || 28;
    const lastPeriod = getLastPeriod(periods);
    const predictedDate = getNextPeriodDate(periods, avgCycleLength);
    const daysUntilNext = getDaysUntilNextPeriod(predictedDate);

    // Current day in cycle
    let currentDay = 1;
    if (lastPeriod) {
      const start = new Date(lastPeriod.startDate);
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      currentDay = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    const fertile = isFertileToday(currentDay, avgCycleLength);

    return res.status(200).json({
      predictedDate,
      daysUntilNext,
      avgCycleLength,
      currentDay,
      isFertile: fertile,
      lastPeriodStartDate: lastPeriod?.startDate || null,
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({ error: 'Failed to calculate prediction' });
  }
};
