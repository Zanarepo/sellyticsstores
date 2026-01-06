// components/StatsCards.jsx - Ultra Compact & Mobile-Friendly
import React from "react";
import { Package, CheckCircle, DollarSign } from "lucide-react";
import { useCurrency } from "../../context/currencyContext";

export default function StatsCards({ 
  totalStock, 
  availableStock, 
  totalValue = 0,
  compact = false 
}) {
  const { formatPrice } = useCurrency();

  const stats = [
    {
      value: totalStock.toLocaleString(),
      label: "Total",
      color: "slate",
      icon: Package,
      bgClass: "bg-slate-100 dark:bg-slate-800",
      textClass: "text-slate-900 dark:text-white",
    },
    {
      value: availableStock.toLocaleString(),
      label: "Available",
      color: "emerald",
      icon: CheckCircle,
      bgClass: "bg-emerald-50 dark:bg-emerald-900/30",
      textClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      value: formatPrice(totalValue),
      label: "Value",
      color: "indigo",
      icon: DollarSign,
      bgClass: "bg-indigo-50 dark:bg-indigo-900/30",
      textClass: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bgClass} rounded-lg p-1.5 sm:p-2 md:p-2.5 text-center min-w-0`}
          >
            {/* Icon - Only show on larger screens if not compact */}
            {!compact && (
              <div className="hidden sm:flex justify-center mb-1">
                <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${stat.textClass}`} />
              </div>
            )}
            
            {/* Value */}
            <p className={`text-xs sm:text-sm md:text-base font-bold ${stat.textClass} truncate`}>
              {stat.value}
            </p>
            
            {/* Label */}
            <p className="text-[8px] sm:text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}