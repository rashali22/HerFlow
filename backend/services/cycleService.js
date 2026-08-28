import { Period } from '../models/Period.js';
import { CycleInsight } from '../models/CycleInsight.js';
import { standardDeviation } from '../utils/math.js';

/**
 * Calculates cycle analytics based on historical period records.
 * @param {Array<{ startDate: Date, endDate?: Date|null }>} periods
 */
export function calculateInsights(periods) {
  if (!periods || periods.length < 2) return null;

  const sorted = periods
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // ---------- Cycle Lengths (start → next start) ----------
  const cycleLengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    cycleLengths.push(Math.round(diff));
  }

  const avgCycleLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : null;

  // ---------- Period Lengths (completed only) ----------
  const completed = sorted.filter((p) => p.endDate);
  const periodLengths = completed.map(
    (p) =>
      Math.round(
        (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
  );

  const avgPeriodLength =
    periodLengths.length > 0
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : null;

  // ---------- Most Recent Period ----------
  const mostRecent = sorted[sorted.length - 1];

  // ---------- Next Period Prediction ----------
  const nextPeriodDate =
    avgCycleLength !== null
      ? new Date(new Date(mostRecent.startDate).getTime() + avgCycleLength * 24 * 60 * 60 * 1000)
      : null;

  return {
    avgCycleLength,
    avgPeriodLength,
    nextPeriodDate,
    totalPeriods: sorted.length,
  };
}

/**
 * Get latest period by start date
 */
export function getLastPeriod(periods) {
  if (!periods || !periods.length) return null;
  return periods.reduce((latest, p) =>
    new Date(p.startDate) > new Date(latest.startDate) ? p : latest
  );
}

/**
 * Average duration of bleeding in days
 */
export function getAveragePeriodLength(periods) {
  if (!periods || !periods.length) return null;
  const completed = periods.filter((p) => p.endDate);
  if (!completed.length) return null;

  const lengths = completed.map(
    (p) =>
      Math.round(
        (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
  );
  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
}

/**
 * Average duration between consecutive period starts
 */
export function getAverageCycleLength(periods) {
  if (!periods || periods.length < 2) return null;

  const sorted = periods
    .slice()
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const cycles = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (new Date(sorted[i].startDate).getTime() - new Date(sorted[i - 1].startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    cycles.push(Math.round(diff));
  }

  return Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
}

/**
 * Next predicted start date
 */
export function getNextPeriodDate(periods, avgCycleLength) {
  if (!periods || !periods.length || avgCycleLength === null) return null;
  const last = getLastPeriod(periods);
  if (!last) return null;

  const next = new Date(last.startDate);
  next.setDate(next.getDate() + avgCycleLength);
  return next;
}

/**
 * Days remaining until next period from today
 */
export function getDaysUntilNextPeriod(nextPeriodDate) {
  if (!nextPeriodDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const next = new Date(nextPeriodDate);
  next.setHours(0, 0, 0, 0);

  return Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Extract array of cycle intervals
 */
export function getCycleLengths(periods) {
  if (!periods || periods.length < 2) return [];

  const sorted = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const lengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].startDate);
    const curr = new Date(sorted[i].startDate);
    lengths.push(Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)));
  }

  return lengths;
}

/**
 * Score regularity based on standard deviation
 */
export function cycleRegularityScore(cycleLengths) {
  if (!cycleLengths || cycleLengths.length < 3) {
    return {
      score: null,
      label: 'Not enough data',
    };
  }

  const sd = standardDeviation(cycleLengths);
  const score = Math.max(0, Math.min(100, 100 - sd * 10));

  let label = 'Irregular';
  if (sd <= 2) label = 'Very Regular';
  else if (sd <= 4) label = 'Regular';
  else if (sd <= 7) label = 'Somewhat Irregular';

  return {
    score: Math.round(score),
    label,
    sd: Math.round(sd * 10) / 10,
  };
}

/**
 * Identify menstrual phase
 */
export function getCyclePhase(day, periodLength = 5, cycleLength = 28) {
  if (day <= periodLength) return 'menstrual';

  const ovulationDay = cycleLength - 14;
  if (day < ovulationDay - 4) return 'follicular';
  if (day >= ovulationDay - 4 && day <= ovulationDay + 1) return 'ovulation';
  return 'luteal';
}

/**
 * Calculate fertility window
 */
export function isFertileToday(day, cycleLength = 28) {
  const ovulationDay = cycleLength - 14;
  const fertileStart = ovulationDay - 4;
  const fertileEnd = ovulationDay + 1;

  return day >= fertileStart && day <= fertileEnd;
}

/**
 * Health notices and potential warning flags
 */
export function getHealthWarnings({ avgPeriodLength, avgCycleLength, dailyFlows = [] }) {
  const warnings = [];

  // Period length
  if (avgPeriodLength && avgPeriodLength > 8) {
    warnings.push(
      'Your periods seem longer than usual. Tracking this over time can help spot patterns.'
    );
  }
  if (avgPeriodLength && avgPeriodLength < 3) {
    warnings.push(
      'Your periods seem shorter than average. Consider consulting a healthcare professional.'
    );
  }

  // Cycle length
  if (avgCycleLength) {
    if (avgCycleLength < 21) {
      warnings.push(
        'Your cycle appears shorter than average. This can sometimes happen due to stress or hormonal changes.'
      );
    }
    if (avgCycleLength > 35) {
      warnings.push(
        'Your cycle appears longer than average. Keeping track may help understand your rhythm.'
      );
    }
  }

  // Flow heaviness
  const heavyDays = dailyFlows.filter((f) => f.intensity === 3);
  if (heavyDays.length >= 3) {
    warnings.push(
      'You’ve logged several heavy flow days. Make sure to rest and stay hydrated.'
    );
  }

  return warnings;
}

/**
 * Sync user cycle insights document in MongoDB
 */
export async function updateUserCycleInsights(userId) {
  const allPeriods = await Period.find({ userId }).sort({ startDate: 1 });

  if (allPeriods.length < 2) {
    // If not enough data, remove or reset
    await CycleInsight.findOneAndDelete({ userId });
    return null;
  }

  const insights = calculateInsights(allPeriods);
  if (!insights) return null;

  const updatedInsight = await CycleInsight.findOneAndUpdate(
    { userId },
    {
      userId,
      avgCycleLength: insights.avgCycleLength,
      avgPeriodLength: insights.avgPeriodLength,
      nextPeriodDate: insights.nextPeriodDate,
      totalPeriods: insights.totalPeriods,
    },
    { upsert: true, new: true }
  );

  return updatedInsight;
}
