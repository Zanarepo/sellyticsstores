import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function TopProductsChart({ data, options, insight, monthLabel }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-white mb-2">
        Top Products in {monthLabel}
      </h2>
      <div className="h-64 sm:h-80">
        <Bar data={data} options={options} />
      </div>
      <div className="mt-2 text-sm">{insight}</div>
    </div>
  );
}
