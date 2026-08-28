import { getUserInsightsBundle } from '../services/insightService.js';
import { CycleInsight } from '../models/CycleInsight.js';

// @desc    Get complete cycle insights and metrics for user
// @route   GET /api/insights
// @access  Private
export const getInsights = async (req, res) => {
  try {
    const bundle = await getUserInsightsBundle(req.user._id);

    // Return the bundle structure which matches both legacy endpoint & rich insight dashboard
    if (!bundle.hasData) {
      return res.status(200).json(null);
    }

    return res.status(200).json({
      avgCycleLength: bundle.insights?.avgCycleLength,
      avgPeriodLength: bundle.insights?.avgPeriodLength,
      nextPeriodDate: bundle.insights?.nextPeriodDate,
      totalPeriods: bundle.insights?.totalPeriods,
      cycleStats: bundle.cycleStats,
      healthWarnings: bundle.healthWarnings,
      monthlyPeriodData: bundle.monthlyPeriodData,
      monthlyFlowData: bundle.monthlyFlowData,
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return res.status(500).json({ error: 'Failed to fetch insights' });
  }
};
