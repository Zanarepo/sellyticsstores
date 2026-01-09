import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function InventoryChart({ summaryData }) {
  const chartData = summaryData.map(s => ({
    name: s.storeName,
    Available: s.totalAvailable,
    Sold: s.totalSold,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow mt-4 w-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 dark:text-gray-200 truncate">
        Inventory Distribution
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            interval={0}
            angle={-30}
            textAnchor="end"
            tick={{ fontSize: 10 }}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={value => `${value} units`}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar dataKey="Available" fill="#8884d8" />
          <Bar dataKey="Sold" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
