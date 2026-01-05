import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function CogsVsSalesChart({ cogsVsSalesData }) {
  const { formatPrice } = useCurrency();
  const [showChart, setShowChart] = useState(true);

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
            return `${context.label}: ${formatPrice(context.parsed.y)}`;
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
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sales vs COGS</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Revenue vs cost comparison</p>
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
            <Bar data={cogsVsSalesData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}