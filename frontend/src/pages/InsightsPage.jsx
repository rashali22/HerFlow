import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insightApi } from '../services/api';
import CircularProgressBar from '../components/CircularProgressBar';
import LineChart from '../components/LineChart';
import FlowChart from '../components/FlowChart';
import { ChevronRight, Calendar, Sparkles, Activity, AlertTriangle, Shield } from 'lucide-react';

function formatDate(date) {
  if (!date) return '--';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function InsightsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await insightApi.getInsights();
        setData(res.data);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-gray-600">Loading cycle intelligence...</p>
        </div>
      </div>
    );
  }

  const cycleStats = data?.cycleStats;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-6 md:py-8 pb-28 px-4 md:px-8 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-primary p-6 md:p-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -top-1/2 -right-[10%] h-[250px] w-[300px] rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-[30%] -left-[5%] h-[200px] w-[200px] rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Knowing Yourself 🌸
              </h1>
              <p className="text-white/80 text-sm md:text-base mt-1">
                {data
                  ? 'Track your continuous rhythm and health patterns over time.'
                  : 'Add more cycle logs on the dashboard to unlock comprehensive insights.'}
              </p>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-full transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!data || !cycleStats ? (
          /* Empty State */
          <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-pink-50 text-pink-500 border border-pink-100 flex items-center justify-center mx-auto mb-4 text-3xl">
              📊
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Insights Available Yet</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              To calculate accurate cycle lengths, phase estimations, and period predictions, please log at least 2 period cycles on your dashboard.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md transition"
            >
              Log Period on Dashboard
            </button>
          </div>
        ) : (
          /* Rich Insights Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Circular Progress & Pro Metrics */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Current Cycle Rhythm
                </h3>

                <CircularProgressBar
                  currentDay={cycleStats.currentDay || 1}
                  periodLength={cycleStats.avgPeriodLength || 5}
                  cycleLength={cycleStats.totalCycleDays || 28}
                />

                {/* Health Notice or Daily Suggestion */}
                {data.healthWarnings && data.healthWarnings.length > 0 ? (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Health Notice</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                      {data.healthWarnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-2xl bg-pink-50/70 border border-pink-200">
                    <div className="flex items-center gap-2 text-pink-600 text-xs font-bold uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Phase Note</span>
                    </div>
                    <p className="text-xs text-pink-800 leading-relaxed font-medium">
                      {cycleStats.dailySuggestion}
                    </p>
                  </div>
                )}

                {/* Pro Metrics Grid */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Pro Analytics
                    </span>
                    <span className="text-xs font-bold text-pink-600">HerFlow Pro</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                        Last Period
                      </span>
                      <span className="text-base font-extrabold text-gray-800 mt-1 block">
                        {formatDate(cycleStats.lastPeriod?.startDate)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                        Next Period
                      </span>
                      <span className="text-base font-extrabold text-gray-800 mt-1 block">
                        {cycleStats.daysUntilNext !== null
                          ? cycleStats.daysUntilNext < 0
                            ? 'May start soon'
                            : cycleStats.daysUntilNext === 0
                            ? 'Today'
                            : `${cycleStats.daysUntilNext} days`
                          : '--'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                        Avg Period Duration
                      </span>
                      <span className="text-base font-extrabold text-gray-800 mt-1 block">
                        {cycleStats.avgPeriodLength ? `${cycleStats.avgPeriodLength} Days` : '--'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100">
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block">
                        Avg Cycle Length
                      </span>
                      <span className="text-base font-extrabold text-gray-800 mt-1 block">
                        {cycleStats.avgCycleLength ? `${cycleStats.avgCycleLength} Days` : '--'}
                      </span>
                    </div>
                  </div>

                  {/* Fertility Status */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-3">
                    <span className="text-xs uppercase font-bold text-emerald-800 block">
                      Fertility Status
                    </span>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                      {cycleStats.isFertile
                        ? '🌱 High fertility window today'
                        : '🌿 Low fertility day in your cycle'}
                    </p>
                  </div>

                  {/* Cycle Regularity */}
                  <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200">
                    <span className="text-xs uppercase font-bold text-primary block">
                      Cycle Regularity
                    </span>
                    <p className="text-xs font-semibold text-primary/90 mt-0.5">
                      {cycleStats.cycleRegularity?.score !== null
                        ? `${cycleStats.cycleRegularity.score}% · ${cycleStats.cycleRegularity.label}`
                        : 'Log 3+ cycles to calculate score'}
                    </p>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-4 text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                    <span>Insights are statistical estimations, not clinical advice.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Trend Charts */}
            <div className="lg:col-span-7 space-y-6">
              {/* Line Chart */}
              <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-500" />
                    <span>Period Length Trends (Months)</span>
                  </h3>
                </div>
                <LineChart data={data.monthlyPeriodData || []} />
              </div>

              {/* Stacked Flow Chart */}
              <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span>Flow Intensity Breakdown (Days/Month)</span>
                  </h3>
                </div>
                <FlowChart data={data.monthlyFlowData || []} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
