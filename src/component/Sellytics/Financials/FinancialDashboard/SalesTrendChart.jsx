import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

export default function SalesTrendChart({ salesTrendData, timeGranularity }) {
  const { formatPrice } = useCurrency();
  const [showChart, setShowChart] = useState(true);

  // Safe default data
  const safeData = salesTrendData || { labels: [], datasets: [] };

  // Show placeholder if no data
  if (!safeData.labels?.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Sales Trend ({timeGranularity?.charAt(0)?.toUpperCase() + timeGranularity?.slice(1) || 'N/A'})
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revenue over time</p>
            </div>
          </div>
        </div>
        <div className="p-6 text-center text-slate-500 dark:text-slate-400">
          No sales data available for this period
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: '#64748b',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatPrice(context.parsed.y)}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
        },
      },
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          font: { size: 11 },
          color: '#64748b',
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <button
        onClick={() => setShowChart(!showChart)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Sales Trend ({timeGranularity?.charAt(0)?.toUpperCase() + timeGranularity?.slice(1) || 'N/A'})
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revenue over time</p>
          </div>
        </div>
        {showChart ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {showChart && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="h-80">
            <Line data={safeData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}