// src/components/SalesDashboard/Component/SalesSummaryCard.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Clock,
  Calendar,
  Zap,
  Award,
} from "lucide-react";
import { useCurrency } from "../../../context/currencyContext";

export default function SalesSummaryCard({ metrics }) {
  const { formatPrice } = useCurrency();

  if (!metrics) return null;

  const bestHour = metrics.bestSellingHours?.reduce(
    (max, h) => (h.total > max.total ? h : max),
    { hour: null, total: 0 }
  ) || { hour: null, total: 0 };

  const last30Total = metrics.last30Days?.reduce((sum, d) => sum + (d.total || 0), 0) || 0;

  const top3Sold = (metrics.mostSoldItems || [])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 text-center mb-8">
        Sales Summary
      </h3>

      {/* Updated Grid: 1 column on mobile → 2 on sm → 3 on lg and above */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Revenue
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white mt-1 truncate">
              {formatPrice(metrics.totalRevenue || 0)}
            </p>
          </div>
        </motion.div>

        {/* Average Daily Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Avg Daily Sales
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white mt-1 truncate">
              {formatPrice(metrics.avgDailySales || 0)}
            </p>
          </div>
        </motion.div>

        {/* Fastest Moving Item */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Fastest Moving
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
              {metrics.fastestMovingItem?.productName || "N/A"}
            </p>
            <p className="text-sm sm:text-base text-amber-600 dark:text-amber-400 mt-2">
              {metrics.fastestMovingItem?.quantity || 0} units
            </p>
          </div>
        </motion.div>

        {/* Top Customer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Top Customer
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
              {metrics.topCustomers?.[0]?.customerName || "N/A"}
            </p>
            <p className="text-sm sm:text-base text-pink-600 dark:text-pink-400 mt-2 truncate">
              {formatPrice(metrics.topCustomers?.[0]?.total || 0)}
            </p>
          </div>
        </motion.div>

        {/* Peak Hour */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Peak Hour
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {bestHour.hour !== null ? `${bestHour.hour}:00` : "—"}
            </p>
            <p className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 mt-2 truncate">
              {bestHour.hour !== null ? formatPrice(bestHour.total) : "No data"}
            </p>
          </div>
        </motion.div>

        {/* Last 30 Days */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Last 30 Days
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white mt-1 truncate">
              {formatPrice(last30Total)}
            </p>
          </div>
        </motion.div>

        {/* Slowest Moving */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Slowest Moving
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
              {metrics.slowestMovingItem?.productName || "N/A"}
            </p>
            <p className="text-sm sm:text-base text-rose-600 dark:text-rose-400 mt-2">
              {metrics.slowestMovingItem?.quantity || 0} units
            </p>
          </div>
        </motion.div>

        {/* Top 3 Best Sellers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              Top 3 Best Sellers
            </p>
            <ol className="mt-3 space-y-2 text-xs sm:text-sm">
              {top3Sold.length > 0 ? (
                top3Sold.map((item, i) => (
                  <li key={item.productId} className="flex flex-col">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {i + 1}. {item.productName}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-fuchsia-600 dark:text-fuchsia-400">
                      {item.quantity} units
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 dark:text-slate-400">No sales yet</li>
              )}
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}