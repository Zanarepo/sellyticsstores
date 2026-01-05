// src/components/dashboard/DashboardStats.jsx
import { FaBoxes, FaFilter, FaCrown } from 'react-icons/fa';

export default function DashboardStats({ toolsCount, categoriesCount, isPremium }) {
  const stats = [
    { label: 'Total Tools', value: toolsCount, icon: FaBoxes, color: 'indigo' },
    { label: 'Categories', value: categoriesCount, icon: FaFilter, color: 'purple' },
    { label: 'Account', value: isPremium ? 'Premium' : 'Free', icon: FaCrown, color: 'amber' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-7xl mx-auto px-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 dark:from-${stat.color}-950 dark:to-${stat.color}-900`}>
              <stat.icon className={`text-${stat.color}-600 dark:text-${stat.color}-400 text-xl`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}