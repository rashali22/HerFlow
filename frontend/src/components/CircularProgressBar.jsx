import React from 'react';

export default function CircularProgressBar({
  currentDay = 1,
  periodLength = 5,
  cycleLength = 28,
}) {
  const mensesEnd = periodLength;
  const ovulationDay = cycleLength - 14;
  const ovulationStart = Math.max(ovulationDay - 1, mensesEnd + 1);
  const ovulationEnd = ovulationDay + 1;
  const follicularLength = Math.max(ovulationStart - mensesEnd - 1, 0);

  const cyclePhases = [
    {
      name: 'Menses',
      days: Array.from({ length: periodLength }, (_, i) => i + 1),
      color: 'rgb(239, 68, 68)',
    },
    {
      name: 'Follicular',
      days: Array.from({ length: follicularLength }, (_, i) => i + 1 + mensesEnd),
      color: 'rgb(236, 72, 153)',
    },
    {
      name: 'Ovulation',
      days: [ovulationStart, ovulationDay, ovulationEnd],
      color: 'rgb(168, 85, 247)',
    },
    {
      name: 'Luteal',
      days: Array.from({ length: Math.max(cycleLength - ovulationEnd, 0) }, (_, i) => i + 1 + ovulationEnd),
      color: 'rgb(79, 70, 229)',
    },
  ];

  function getPhaseInfo(day) {
    const phase = cyclePhases.find((p) => p.days.includes(day));
    return phase || cyclePhases[0];
  }

  const cycleDay = currentDay <= cycleLength ? currentDay : cycleLength;
  const daysLate = currentDay > cycleLength ? currentDay - cycleLength : 0;
  const phaseInfo = getPhaseInfo(cycleDay);
  const isLate = currentDay > cycleLength;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = Math.min(Math.max((cycleDay / cycleLength) * 100, 0), 100);
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth="8"
            fill="none"
          />

          {/* Dynamic phase progress track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={isLate ? 'rgb(239, 68, 68)' : phaseInfo.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          {isLate ? (
            <>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Expected Period
              </span>
              <span className="text-3xl font-black text-gray-800 mt-1">
                Day {daysLate}
              </span>
              <span className="text-[11px] text-red-600 font-medium">Late</span>
            </>
          ) : (
            <>
              <span
                className="text-sm font-semibold tracking-wide"
                style={{ color: phaseInfo.color }}
              >
                {phaseInfo.name} Phase
              </span>
              <span className="text-4xl font-extrabold text-gray-800 tracking-tight my-0.5">
                Day {currentDay}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                of {cycleLength} days
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
