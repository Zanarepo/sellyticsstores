import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChevronDown, ChevronUp, PieChart } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseBreakdownChart({ expensePieData, hasData }) {
  const { formatPrice } = useCurrency();
  const [showChart, setShowChart] = useState(true);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
            return `${context.label}: ${formatPrice(context.parsed)}`;
          }
        }
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
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expense Breakdown</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Spending by category</p>
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
          {hasData ? (
            <div className="h-80">
              <Pie data={expensePieData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-slate-500 dark:text-slate-400">No expense data available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}