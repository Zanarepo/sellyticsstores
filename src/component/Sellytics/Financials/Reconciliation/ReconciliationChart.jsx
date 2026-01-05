import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ReconciliationChart({ paymentMethods, salesByPaymentMethod, reconciliationChecks, checkDate }) {
  const { formatPrice } = useCurrency();
  const [showChart, setShowChart] = useState(false);

  const chartData = {
    labels: paymentMethods,
    datasets: [
      {
        label: 'Expected Amount',
        data: paymentMethods.map(method => salesByPaymentMethod[method]?.amount || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2,
      },
      {
        label: 'Actual Amount',
        data: paymentMethods.map(method => {
          const check = reconciliationChecks.find(
            c => c.payment_method === method.toLowerCase() && c.check_date === checkDate
          );
          return check ? check.actual_amount : 0;
        }),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: '#4f46e5',
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

  if (paymentMethods.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <button
        onClick={() => setShowChart(!showChart)}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expected vs Actual</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visual comparison by payment method</p>
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
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}