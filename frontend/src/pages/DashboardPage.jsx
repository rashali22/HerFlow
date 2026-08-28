import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { periodApi, flowApi, insightApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Save,
  Activity,
  TrendingUp,
  Droplets,
  Bell,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const FLOW_STATES = [
  { value: 0, label: 'None', color: '#F3E4E4', textColor: '#2A2A2A' },
  { value: 1, label: 'Light', color: '#E9D5E1', textColor: '#2A2A2A' },
  { value: 2, label: 'Medium', color: '#FBBBCE', textColor: '#2A2A2A' },
  { value: 3, label: 'Heavy', color: '#FCA5AC', textColor: '#2A2A2A' },
];

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toISODate(d) {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const { user, updateEmailPreference } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('flow'); // 'flow' | 'period'
  const [periods, setPeriods] = useState([]);
  const [dailyFlows, setDailyFlows] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flow form
  const [flowDate, setFlowDate] = useState(toISODate(new Date()));
  const [flowIntensity, setFlowIntensity] = useState(1);
  const [savingFlow, setSavingFlow] = useState(false);

  // Period form
  const [startDate, setStartDate] = useState(toISODate(new Date()));
  const [hasEnded, setHasEnded] = useState(false);
  const [endDate, setEndDate] = useState(toISODate(new Date()));
  const [savingPeriod, setSavingPeriod] = useState(false);

  // Calendar month
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDateTooltip, setSelectedDateTooltip] = useState(null);

  // Email notifications
  const [emailEnabled, setEmailEnabled] = useState(user?.emailNotifications || false);
  const [savingEmail, setSavingEmail] = useState(false);

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const greeting = useMemo(() => {
    return Math.random() > 0.5 ? 'Namaste' : 'Konnichiwa';
  }, []);

  // Fetch all user records
  const loadDashboardData = async () => {
    try {
      const [periodsRes, flowsRes, insightsRes] = await Promise.allSettled([
        periodApi.getAll(),
        flowApi.getAll(),
        insightApi.getInsights(),
      ]);

      if (periodsRes.status === 'fulfilled') {
        setPeriods(periodsRes.value.data || []);
      }
      if (flowsRes.status === 'fulfilled') {
        setDailyFlows(flowsRes.value.data || []);
      }
      if (insightsRes.status === 'fulfilled') {
        setInsights(insightsRes.value.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (user?.emailNotifications !== undefined) {
      setEmailEnabled(user.emailNotifications);
    }
  }, [user]);

  // Sync flow intensity if flow exists for selected date
  useEffect(() => {
    const existing = dailyFlows.find((f) => toISODate(f.date) === flowDate);
    if (existing) {
      setFlowIntensity(existing.intensity);
    } else {
      setFlowIntensity(1);
    }
  }, [flowDate, dailyFlows]);

  // Check active period
  const activePeriod = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return periods.find((p) => {
      const start = new Date(p.startDate);
      start.setHours(0, 0, 0, 0);
      return !p.endDate && start <= today;
    });
  }, [periods]);

  const activePeriodDay = useMemo(() => {
    if (!activePeriod) return null;
    const start = new Date(activePeriod.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [activePeriod]);

  // Calculate prediction days remaining
  const daysUntilNext = useMemo(() => {
    if (!insights?.nextPeriodDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next = new Date(insights.nextPeriodDate);
    next.setHours(0, 0, 0, 0);
    return Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [insights]);

  // Save Flow
  const handleSaveFlow = async () => {
    if (!flowDate) return;
    setSavingFlow(true);
    try {
      const res = await flowApi.createOrUpdate({
        date: flowDate,
        intensity: flowIntensity,
      });

      const updatedDate = toISODate(res.data.date);
      setDailyFlows((prev) => {
        const filtered = prev.filter((f) => toISODate(f.date) !== updatedDate);
        return [res.data, ...filtered];
      });

      showToast('Daily flow logged successfully!');
    } catch (err) {
      console.error('Save flow error:', err);
      showToast('Failed to save flow record.', 'error');
    } finally {
      setSavingFlow(false);
    }
  };

  // Save Period
  const handleSavePeriod = async () => {
    if (!startDate) return;
    if (hasEnded && endDate && new Date(endDate) < new Date(startDate)) {
      showToast('End date cannot be before start date.', 'error');
      return;
    }

    setSavingPeriod(true);
    try {
      const res = await periodApi.create({
        startDate,
        endDate: hasEnded ? endDate : null,
      });

      showToast('Period logged successfully!');
      // Reload updated insights and periods
      loadDashboardData();
    } catch (err) {
      console.error('Save period error:', err);
      showToast('Failed to save period.', 'error');
    } finally {
      setSavingPeriod(false);
    }
  };

  // Delete Period
  const handleDeletePeriod = async (id) => {
    try {
      await periodApi.delete(id);
      setPeriods((prev) => prev.filter((p) => (p._id || p.id) !== id));
      showToast('Period deleted.');
      loadDashboardData();
    } catch (err) {
      console.error('Delete period error:', err);
      showToast('Failed to delete period.', 'error');
    }
  };

  // Toggle Email Reminders
  const handleToggleEmail = async () => {
    const next = !emailEnabled;
    setEmailEnabled(next);
    setSavingEmail(true);
    const success = await updateEmailPreference(next);
    if (!success) {
      setEmailEnabled(!next);
      showToast('Could not update reminder setting.', 'error');
    } else {
      showToast(next ? 'Period reminder emails enabled!' : 'Period reminders disabled.');
    }
    setSavingEmail(false);
  };

  // Calendar Day Generation
  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
  };
  const nextMonth = () => {
    setCurrentCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const periodLengthPreview = useMemo(() => {
    if (!startDate || !hasEnded || !endDate) return null;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff;
  }, [startDate, hasEnded, endDate]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-6 md:py-8 pb-28 px-4 md:px-8 overflow-x-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs md:text-sm font-bold text-white ${
              toastMessage.type === 'error' ? 'bg-red-500' : 'bg-primary'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-primary p-6 md:p-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -top-1/2 -right-[10%] h-[250px] w-[300px] rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-[30%] -left-[5%] h-[200px] w-[200px] rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {greeting}, {user?.name?.split(' ')[0] || 'Friend'}! 🌸
              </h1>
              <p className="text-white/80 text-sm md:text-base mt-1">
                {activePeriod ? (
                  <span>
                    You are on <strong>day {activePeriodDay}</strong> of your period.
                  </span>
                ) : insights?.nextPeriodDate ? (
                  daysUntilNext !== null ? (
                    daysUntilNext < 0 ? (
                      'Your period may be slightly late.'
                    ) : daysUntilNext === 0 ? (
                      'Your period may start today.'
                    ) : daysUntilNext === 1 ? (
                      'Your next period is expected in 1 day.'
                    ) : (
                      `Your next period is expected in ${daysUntilNext} days.`
                    )
                  ) : (
                    'Calculating your next cycle prediction...'
                  )
                ) : (
                  'Log your period dates below to unlock personal insights and predictions.'
                )}
              </p>
            </div>

            <button
              onClick={() => navigate('/insights')}
              className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-full transition flex items-center gap-1.5 shadow-sm"
            >
              <span>View Insights</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Reminder Toggle Card */}
        <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-primary flex-shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800">Email Period Reminders</p>
              <p className="text-xs text-gray-500">
                Receive a gentle notification 2 days before your predicted period
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={savingEmail}
            onClick={handleToggleEmail}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              emailEnabled ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Action Tabs Card: Daily Flow vs Track Period */}
        <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm">
          {/* Tab Selector */}
          <div className="flex bg-pink-50 p-1.5 rounded-2xl mb-6 border border-pink-100 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('flow')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'flow'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Droplets className="w-4 h-4" />
              <span>Daily Flow</span>
            </button>
            <button
              onClick={() => setActiveTab('period')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'period'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Track Period</span>
            </button>
          </div>

          {/* Tab Content: Daily Flow */}
          {activeTab === 'flow' && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={flowDate}
                  max={toISODate(new Date())}
                  onChange={(e) => setFlowDate(e.target.value)}
                  className="w-full py-3 px-4 bg-pink-50/40 border border-gray-200 rounded-xl text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div className="bg-pink-50/60 rounded-2xl p-6 border border-pink-100 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-gray-600 uppercase">
                  <span>Intensity Level</span>
                  <span className="text-primary font-bold">{FLOW_STATES[flowIntensity].label}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={flowIntensity}
                  onChange={(e) => setFlowIntensity(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {FLOW_STATES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFlowIntensity(f.value)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        flowIntensity === f.value
                          ? 'border-primary scale-105 shadow-sm'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: f.color, color: f.textColor }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={savingFlow}
                onClick={handleSaveFlow}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingFlow ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving Flow...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Daily Flow</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab Content: Track Period */}
          {activeTab === 'period' && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  max={toISODate(new Date())}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full py-3 px-4 bg-pink-50/40 border border-gray-200 rounded-xl text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-pink-50/60 rounded-xl border border-pink-100">
                <input
                  type="checkbox"
                  id="hasEndedCheckbox"
                  checked={hasEnded}
                  onChange={(e) => setHasEnded(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <label
                  htmlFor="hasEndedCheckbox"
                  className="text-xs md:text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  My period has ended
                </label>
              </div>

              {hasEnded && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={toISODate(new Date())}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full py-3 px-4 bg-pink-50/40 border border-gray-200 rounded-xl text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              )}

              {periodLengthPreview !== null && (
                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 text-center text-xs font-bold text-purple-700">
                  {periodLengthPreview < 1 ? (
                    <span className="text-red-500">End date must be after start date</span>
                  ) : (
                    <span>
                      Duration: {periodLengthPreview} day{periodLengthPreview > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={savingPeriod}
                onClick={handleSavePeriod}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {savingPeriod ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Saving Period...
                  </span>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4" />
                    <span>Save Period Record</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Interactive Cycle History Calendar */}
        <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-black text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-500" />
              <span>Cycle History Calendar</span>
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-gray-700 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs md:text-sm font-bold text-gray-700 w-28 text-center">
                {currentCalendarDate.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-gray-700 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 md:gap-2 text-center text-xs">
            {[
              { short: 'S', full: 'Sun' },
              { short: 'M', full: 'Mon' },
              { short: 'T', full: 'Tue' },
              { short: 'W', full: 'Wed' },
              { short: 'T', full: 'Thu' },
              { short: 'F', full: 'Fri' },
              { short: 'S', full: 'Sat' },
            ].map((d, i) => (
              <div key={i} className="font-bold text-gray-400 py-1 uppercase tracking-wider">
                <span className="sm:hidden">{d.short}</span>
                <span className="hidden sm:inline">{d.full}</span>
              </div>
            ))}

            {/* Empty offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10 md:h-12" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(calendarYear, calendarMonth, dayNum);
              const dateStr = toISODate(dateObj);

              // Find flow for day
              const flowEntry = dailyFlows.find((f) => toISODate(f.date) === dateStr);
              const flowState = flowEntry ? FLOW_STATES[flowEntry.intensity] : null;

              // Check if inside any period
              let isPeriod = false;
              let dayInPeriod = 0;
              for (const p of periods) {
                const pStart = new Date(p.startDate);
                pStart.setHours(0, 0, 0, 0);
                const pEnd = p.endDate ? new Date(p.endDate) : pStart;
                pEnd.setHours(0, 0, 0, 0);

                if (dateObj >= pStart && dateObj <= pEnd) {
                  isPeriod = true;
                  dayInPeriod =
                    Math.floor((dateObj.getTime() - pStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  break;
                }
              }

              const isSelected = selectedDateTooltip === dateStr;

              return (
                <div key={dayNum} className="relative group flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (flowState || isPeriod) {
                        setSelectedDateTooltip(isSelected ? null : dateStr);
                      }
                    }}
                    style={{
                      backgroundColor: flowState ? flowState.color : isPeriod ? '#FBBBCE' : undefined,
                    }}
                    className={`w-full h-10 md:h-12 rounded-xl flex items-center justify-center text-xs md:text-sm font-semibold transition-all ${
                      isPeriod
                        ? 'border-2 border-pink-400 font-bold text-gray-800'
                        : flowState
                        ? 'border border-pink-200'
                        : 'text-gray-700 hover:bg-pink-50/50'
                    }`}
                  >
                    {dayNum}
                  </button>

                  {/* Tooltip */}
                  {(flowState || isPeriod) && (
                    <div
                      className={`absolute bottom-full mb-2 bg-gray-900 text-white text-[11px] font-medium rounded-lg px-2.5 py-1 whitespace-nowrap z-20 pointer-events-none transition-opacity ${
                        isSelected ? 'flex' : 'hidden group-hover:flex'
                      }`}
                    >
                      {isPeriod && flowState
                        ? `Day ${dayInPeriod} (${flowState.label} Flow)`
                        : isPeriod
                        ? `Period Day ${dayInPeriod}`
                        : `${flowState.label} Flow`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Past Periods Records Card */}
        {periods.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm border border-pink-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" />
              <span>Past Logged Periods</span>
            </h2>

            <div className="space-y-3">
              {periods.map((p) => {
                const s = new Date(p.startDate);
                const e = p.endDate ? new Date(p.endDate) : null;
                const length = e
                  ? Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
                  : null;
                const periodId = p._id || p.id;

                return (
                  <div
                    key={periodId}
                    className="flex justify-between items-start p-4 bg-pink-50/50 rounded-2xl border border-pink-100 hover:shadow-sm transition gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-800 break-words">
                        {formatDate(p.startDate)} → {p.endDate ? formatDate(p.endDate) : 'Ongoing'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Duration:{' '}
                        <strong className="text-pink-600">
                          {length ? `${length} day${length > 1 ? 's' : ''}` : 'Ongoing'}
                        </strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePeriod(periodId)}
                      title="Delete Period"
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
