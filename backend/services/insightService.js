import { Period } from '../models/Period.js';
import { DailyFlow } from '../models/DailyFlow.js';
import { CycleInsight } from '../models/CycleInsight.js';
import {
  getLastPeriod,
  getAveragePeriodLength,
  getAverageCycleLength,
  getNextPeriodDate,
  getDaysUntilNextPeriod,
  getCycleLengths,
  cycleRegularityScore,
  getCyclePhase,
  isFertileToday,
  getHealthWarnings,
} from './cycleService.js';

export const phaseSuggestions = {
  menstrual: [
    'Low energy days — rest and hydration can help 🌸',
    'It’s okay to slow down today. Be kind to your body 💗',
    'Gentle movement and warmth may feel comforting today.',
    'You may feel more tired today — listening to your body helps.',
    'Rest, fluids, and light meals can support you today.',
  ],
  follicular: [
    'Your energy may be rising — a good time to start new things ✨',
    'You might feel clearer and more motivated today.',
    'This phase often brings fresh energy and focus.',
    'A great time to plan, learn, or try something new 🌱',
    'You may feel lighter and more optimistic today.',
  ],
  ovulation: [
    'You may feel more confident and social today 🌼',
    'Your body is at a natural peak of energy right now.',
    'Good day for communication and connection 💬',
    'You might feel stronger and more expressive today.',
    'Energy and mood often feel balanced in this phase.',
  ],
  luteal: [
    'Slowing down a bit may feel good today 💛',
    'Self-care and rest can be especially helpful now.',
    'You might feel more sensitive — that’s completely normal.',
    'Focus on comfort and simple routines today.',
    'Listening to your needs is important in this phase.',
  ],
};

function monthKey(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 7); // YYYY-MM
}

function daysBetween(start, end) {
  return (
    Math.floor(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );
}

/**
 * Generates comprehensive cycle metrics and chart datasets for a user.
 */
export async function getUserInsightsBundle(userId) {
  const [periods, dailyFlows, insightDoc] = await Promise.all([
    Period.find({ userId }).sort({ startDate: 1 }),
    DailyFlow.find({ userId }).sort({ date: 1 }),
    CycleInsight.findOne({ userId }),
  ]);

  if (!periods || periods.length === 0) {
    return {
      hasData: false,
      insights: null,
      cycleStats: null,
      periods: [],
      dailyFlows: [],
      monthlyPeriodData: [],
      monthlyFlowData: [],
      healthWarnings: [],
    };
  }

  const avgPeriodLength = getAveragePeriodLength(periods);
  const avgCycleLength = getAverageCycleLength(periods);
  const lastPeriod = getLastPeriod(periods);
  const nextPeriodDate = getNextPeriodDate(periods, avgCycleLength);
  const daysUntilNext = getDaysUntilNextPeriod(nextPeriodDate);

  // Current cycle day calculation
  let currentDay = 1;
  if (lastPeriod) {
    const start = new Date(lastPeriod.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    currentDay = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const totalCycleDays = avgCycleLength || 28;
  const currentPhase = getCyclePhase(currentDay, avgPeriodLength || 5, totalCycleDays);
  const fertileStatus = isFertileToday(currentDay, totalCycleDays);
  const regularity = cycleRegularityScore(getCycleLengths(periods));

  const warnings = getHealthWarnings({
    avgPeriodLength: avgPeriodLength || 5,
    avgCycleLength: avgCycleLength || 28,
    dailyFlows,
  });

  // Monthly Period Duration data (for Line Chart)
  const periodMap = new Map();
  periods.forEach((p) => {
    if (!p.endDate) return;
    const key = monthKey(p.startDate);
    const length = daysBetween(p.startDate, p.endDate);
    if (!periodMap.has(key)) periodMap.set(key, []);
    periodMap.get(key).push(length);
  });

  const monthlyPeriodData = Array.from(periodMap.entries()).map(([month, values]) => ({
    month,
    cycleDays: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  }));

  // Monthly Flow intensity breakdown (for Stacked Bar Chart)
  const flowMap = new Map();
  dailyFlows.forEach((f) => {
    const key = monthKey(f.date);
    if (!flowMap.has(key)) {
      flowMap.set(key, { light: 0, medium: 0, heavy: 0 });
    }
    const bucket = flowMap.get(key);
    if (f.intensity === 1) bucket.light++;
    if (f.intensity === 2) bucket.medium++;
    if (f.intensity === 3) bucket.heavy++;
  });

  const monthlyFlowData = Array.from(flowMap.entries()).map(([month, counts]) => ({
    month,
    ...counts,
  }));

  // Random daily tip for current phase
  const suggestions = phaseSuggestions[currentPhase] || phaseSuggestions.follicular;
  const dailySuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

  return {
    hasData: true,
    insights: insightDoc || {
      avgCycleLength,
      avgPeriodLength,
      nextPeriodDate,
      totalPeriods: periods.length,
    },
    cycleStats: {
      avgPeriodLength,
      avgCycleLength,
      lastPeriod,
      nextPeriodDate,
      daysUntilNext,
      currentDay,
      totalCycleDays,
      currentPhase,
      isFertile: fertileStatus,
      cycleRegularity: regularity,
      dailySuggestion,
    },
    periods,
    dailyFlows,
    monthlyPeriodData,
    monthlyFlowData,
    healthWarnings: warnings,
  };
}
