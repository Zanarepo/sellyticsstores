import React from 'react';
import { Bar } from 'react-chartjs-2';

const TopProductsChart = ({ data, options }) => (
  <div className="h-64 sm:h-80">
    <Bar data={data} options={options} />
  </div>
);

export default TopProductsChart;
