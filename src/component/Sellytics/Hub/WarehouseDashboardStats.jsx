// WarehouseDashboardStats.jsx - Dashboard Statistics Cards (shadcn-free version)
import React from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  RotateCcw,
  Store,
  Users,
  TrendingUp,
} from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon, color, delay = 0 }) => {
  const colorClasses = {
    indigo: {
      gradient: "from-indigo-500 to-indigo-600",
      text: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    emerald: {
      gradient: "from-emerald-500 to-emerald-600",
      text: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      text: "text-amber-600",
      bg: "bg-amber-50"
    },
    rose: {
      gradient: "from-rose-500 to-rose-600",
      text: "text-rose-600",
      bg: "bg-rose-50"
    },
    violet: {
      gradient: "from-violet-500 to-violet-600",
      text: "text-violet-600",
      bg: "bg-violet-50"
    },
    cyan: {
      gradient: "from-cyan-500 to-cyan-600",
      text: "text-cyan-600",
      bg: "bg-cyan-50"
    },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="relative"
    >
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow duration-300 border border-slate-100">
        {/* Subtle gradient circle decoration */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
              {change !== null && change !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  <TrendingUp className={`w-4 h-4 ${change < 0 ? "rotate-180" : ""}`} />
                  <span>{Math.abs(change)}% vs last month</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 ">
    <div className="flex items-start justify-between ">
      <div className="space-y-3">
        <div className="h-4 w-28 bg-slate-200 rounded animate-pulse " />
        <div className="h-9 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="h-12 w-12 bg-slate-200 rounded-xl animate-pulse" />
    </div>
  </div>
);

export default function WarehouseDashboardStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Inventory",
      value: stats?.totalInventory?.toLocaleString() || "0",
      change: stats?.inventoryChange ?? null,
      icon: Package,
      color: "indigo"
    },
    {
      title: "Internal Stores",
      value: stats?.internalStores || "0",
      icon: Store,
      color: "emerald"
    },
    {
      title: "External Clients",
      value: stats?.externalClients || "0",
      icon: Users,
      color: "violet"
    },
    {
      title: "Pending Returns",
      value: stats?.pendingReturns || "0",
      icon: RotateCcw,
      color: stats?.pendingReturns > 0 ? "amber" : "cyan"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}