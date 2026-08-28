import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function LineChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg
          className="w-12 h-12 mb-3 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 19V5M4 19H20"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 15l4-4 4 3 4-6"
          />
        </svg>
        <p className="text-sm font-medium">No period duration trends available yet.</p>
        <p className="text-xs text-gray-400 mt-1">Log at least two periods with end dates.</p>
      </div>
    );
  }

  const labels = data.map((item) => {
    const date = new Date(item.month + '-01');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  });

  const values = data.map((d) => d.cycleDays);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Period Duration (Days)',
        data: values,
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#EC4899',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: 10,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} days duration`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 8,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0,0,0,0.06)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
