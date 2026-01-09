import { Store, Box, TrendingUp, Award } from "lucide-react";

export default function InventorySummaryCard({ metrics }) {
  const { totalAvailable, storeSummary, topStore } = metrics || {};
  const avgAvailable = storeSummary?.length ? totalAvailable / storeSummary.length : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
      <Card
        icon={<Box />}
        label="Total Available"
        value={totalAvailable || 0}
        bg="bg-indigo-100"
        color="text-indigo-600"
      />
      <Card
        icon={<TrendingUp />}
        label="Avg Available / Store"
        value={Math.round(avgAvailable)}
        bg="bg-emerald-100"
        color="text-emerald-600"
      />
      <Card
        icon={<Award />}
        label="Top Store"
        value={topStore?.storeName || "—"}
        subValue={`Available: ${topStore?.totalAvailable || 0}`}
        bg="bg-amber-100"
        color="text-amber-600"
      />
      <Card
        icon={<Store />}
        label="Total Stores"
        value={storeSummary?.length || 0}
        bg="bg-sky-100"
        color="text-sky-600"
      />
    </div>
  );
}

function Card({ icon, label, value, subValue, bg, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border flex items-center gap-3 w-full">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded ${bg} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{label}</p>
        <p className="text-sm sm:text-base font-bold truncate">{value}</p>
        {subValue && (
          <p className={`text-[10px] sm:text-xs ${color} truncate`}>{subValue}</p>
        )}
      </div>
    </div>
  );
}
