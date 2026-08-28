import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Activity, Calendar, Brain, Shield, ChevronRight } from 'lucide-react';
import { AuroraText } from '../components/AuroraText';
import { useAuth } from '../context/AuthContext';
import { insightApi, periodApi } from '../services/api';

const features = [
  {
    id: 1,
    title: 'Get Clarity',
    subtitle: 'CLARITY',
    description: 'Get warm, personalized answers to all your cycle and well-being questions with HerFlow AI assistant.',
    color: 'bg-pink-500',
    icon: Brain,
  },
  {
    id: 2,
    title: 'Effortless Tracking',
    subtitle: 'CYCLE',
    description: 'Your central hub to log periods and daily flow intensities in just a few taps.',
    color: 'bg-teal-600',
    icon: Calendar,
  },
  {
    id: 3,
    title: 'Personalized Insights',
    subtitle: 'INSIGHTS',
    description: 'Understand your body with phase tracking, rolling cycle averages, and period predictions.',
    color: 'bg-[#FF6F79]',
    icon: Activity,
  },
  {
    id: 4,
    title: 'Secured Privacy',
    subtitle: 'PRIVACY',
    description: 'Strict user data isolation and JWT authentication ensures your private health data belongs only to you.',
    color: 'bg-[#6C63FF]',
    icon: Shield,
  },
];

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntilNext(date) {
  if (!date) return null;
  const today = new Date();
  const next = new Date(date);
  today.setHours(0, 0, 0, 0);
  next.setHours(0, 0, 0, 0);
  return Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getActivePeriod(periods) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (periods || []).find((p) => {
    const start = new Date(p.startDate);
    start.setHours(0, 0, 0, 0);
    if (p.endDate) return false;
    return start <= today;
  });
}

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [insights, setInsights] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [insRes, perRes] = await Promise.allSettled([
          insightApi.getInsights(),
          periodApi.getAll(),
        ]);
        if (insRes.status === 'fulfilled' && insRes.value.data) {
          setInsights(insRes.value.data);
        }
        if (perRes.status === 'fulfilled' && perRes.value.data) {
          setPeriods(perRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load landing page preview data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const activePeriod = getActivePeriod(periods);

  let activePeriodDay = null;
  if (activePeriod) {
    const start = new Date(activePeriod.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    activePeriodDay = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const latestPeriod = periods.length > 0 ? periods[0] : null;

  return (
    <div ref={containerRef} className="relative bg-background text-foreground font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative z-10 min-h-[calc(100vh-3.5rem)] w-full flex flex-col justify-between p-6 md:px-12 md:py-8 border-b border-primary/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center uppercase tracking-widest text-xs md:text-sm font-bold text-gray-primary/70 pb-3 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <span className="text-base">🌸</span>
            <span>HerFlow</span>
          </div>
          <div className="text-xs md:text-sm tracking-[0.15em] text-gray-600 font-medium italic mt-1 sm:mt-0">
            {isAuthenticated && latestPeriod
              ? `Last period • ${formatDate(latestPeriod.startDate)}`
              : formatDate(new Date())}
          </div>
        </div>

        <div className="my-auto py-8 md:py-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[22vw] sm:text-[18vw] md:text-[13vw] leading-[0.88] font-black text-primary tracking-tighter uppercase"
          >
            Clarity{' '}
            <span className="italic font-serif font-light sm:ml-4">
              <AuroraText colors={['#5A8D80', '#7EAE9F', '#A3C8BC', '#6E9E91']}>
                Every&nbsp;
              </AuroraText>
            </span>
            Month
          </motion.h1>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-primary/20 pt-8 mt-8 gap-6">
            <div>
              <p className="max-w-xl text-base md:text-2xl text-gray-primary font-medium leading-relaxed">
                {isAuthenticated ? (
                  activePeriod ? (
                    <span className="text-primary font-bold">
                      🌸 You are on day {activePeriodDay} of your period.
                    </span>
                  ) : insights?.nextPeriodDate ? (
                    (() => {
                      const days = daysUntilNext(insights.nextPeriodDate);
                      if (days === null) return 'Keep tracking for period predictions.';
                      if (days < 0) return 'Your period may be slightly late.';
                      if (days === 0) return 'Your period may start today.';
                      if (days === 1) return 'Next period predicted in 1 day.';
                      return `Next period predicted in ${days} days.`;
                    })()
                  ) : loading ? (
                    'Loading your cycle insights...'
                  ) : (
                    'Log your period dates on the dashboard to unlock personalized predictions.'
                  )
                ) : (
                  'Your menstrual insights, health rhythm, and privacy — always yours.'
                )}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-2">
                Smart cycle tracking & AI companion with 100% personal data isolation.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg transition flex items-center gap-2"
                >
                  Go to Dashboard
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-full shadow-lg transition flex items-center gap-2"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pb-4">
          <span>Scroll to explore features</span>
          <ArrowDown className="w-5 h-5 text-primary animate-bounce" />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary/70">
            Why HerFlow
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-primary mt-2">
            Built for peace of mind
          </h2>
          <p className="text-gray-primary text-sm md:text-base mt-3">
            An intuitive, distraction-free environment to understand your body and stay prepared.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-6 shadow-md`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-gray-400">
                    {feature.subtitle}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA / Footer Section */}
      <section className="bg-primary text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              HerFlow
            </h2>
            <span className="text-3xl md:text-5xl leading-none select-none">🌸</span>
          </div>
          <p className="text-white/80 text-base md:text-lg mb-8 max-w-lg mx-auto">
            Take control of your menstrual cycle with privacy, predictive analytics, and personalized AI support.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={isAuthenticated ? '/clarity' : '/login'}
              className="bg-white text-primary hover:bg-pink-50 font-bold px-8 py-3.5 rounded-full shadow-lg transition"
            >
              {isAuthenticated ? 'Chat with HerFlow AI' : 'Start Tracking Today'}
            </Link>
            <Link
              to={isAuthenticated ? '/insights' : '/login'}
              className="border border-white/30 hover:bg-white/10 text-white font-bold px-8 py-3.5 rounded-full transition"
            >
              View Insights
            </Link>
          </div>

          <div className="mt-16 text-xs text-white/50 border-t border-white/10 pt-6">
            © {new Date().getFullYear()} HerFlow. Dedicated to health, privacy, and well-being.
          </div>
        </div>
      </section>
    </div>
  );
}
