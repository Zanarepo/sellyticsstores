import React from 'react';
import { DollarSign, Award, Store, TrendingUp } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';

export default function DebtorsSummaryCards({ summaryData, highestDebtStore }) {
  const { formatPrice } = useCurrency();

  const totalOwed = summaryData.reduce((sum, s) => sum + s.totalOwed, 0);
  const outstanding = summaryData.reduce((sum, s) => sum + s.outstanding, 0);
  const avgOutstanding = summaryData.length ? outstanding / summaryData.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      <Card icon={<DollarSign size={16} />} label="Total Owed" value={formatPrice(totalOwed)} bg="bg-indigo-100" color="text-indigo-600" />
      <Card icon={<TrendingUp size={16} />} label="Avg Outstanding" value={formatPrice(avgOutstanding)} bg="bg-emerald-100" color="text-emerald-600" />
      <Card
        icon={<Award size={16} />}
        label="Highest Debt Store"
        value={highestDebtStore?.storeName || '—'}
        subValue={formatPrice(highestDebtStore?.outstanding || 0)}
        bg="bg-amber-100"
        color="text-amber-600"
      />
      <Card icon={<Store size={16} />} label="Total Stores" value={summaryData.length} bg="bg-sky-100" color="text-sky-600" />
    </div>
  );
}

function Card({ icon, label, value, subValue, bg, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border flex items-center gap-2 min-h-[60px]">
      {/* Icon */}
      <div className={`w-8 h-8 rounded flex items-center justify-center ${bg} shrink-0`}>
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex flex-col">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-sm font-bold truncate">{value}</p>
        {subValue && <p className={`text-[10px] ${color} truncate`}>{subValue}</p>}
      </div>
    </div>
  );
}
