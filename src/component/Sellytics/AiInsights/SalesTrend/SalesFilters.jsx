import React from 'react';

const SalesFilters = ({ selectedMonth, setSelectedMonth, rangeFilter, setRangeFilter }) => {
  const monthOptions = [];
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    monthOptions.push({ value: date.toISOString().slice(0, 7), label: date.toLocaleString('default', { month: 'long', year: 'numeric' }) });
  }

  const rangeOptions = [
    { value: 'single', label: 'Selected Month' },
    { value: 'last3', label: 'Last 3 Months' },
    { value: 'last6', label: 'Last 6 Months' },
    { value: 'last9', label: 'Last 9 Months' },
    { value: 'last12', label: 'Last 12 Months' },
    { value: 'all', label: 'All Months' },
  ];

  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:space-x-4">
      <div>
        <label>Select Month:</label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label>Show Trends:</label>
        <select value={rangeFilter} onChange={e => setRangeFilter(e.target.value)}>
          {rangeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
};

export default SalesFilters;
