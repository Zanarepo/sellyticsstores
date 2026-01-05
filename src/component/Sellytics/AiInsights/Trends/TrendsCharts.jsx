/**
 * Trends Charts Component
 */
import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, Package } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function TrendsCharts({ trends, topProducts, selectedMonth }) {
  const growthData = {
    labels: trends.map(t => t.month),
    datasets: [
      {
        label: 'Monthly Growth (%)',
        data: trends.map(t => Math.min(Math.max((t.monthly_growth || 0) * 100, -100), 100)),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const topProductsData = {
    labels: Object.keys(topProducts),
    datasets: [
      {
        label: 'Units Sold',
        data: Object.values(topProducts),
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          '#4f46e5',
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          color: '#64748b',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Growth Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Growth</h3>
            <p className="text-sm text-slate-500">Percentage change month-over-month</p>
          </div>
        </div>
        <div className="h-80">
          <Line data={growthData} options={chartOptions} />
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Products</h3>
            <p className="text-sm text-slate-500">
              {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="h-80">
          <Bar data={topProductsData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}