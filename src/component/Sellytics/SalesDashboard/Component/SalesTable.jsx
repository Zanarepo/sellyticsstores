// src/components/SalesDashboard/Component/SalesTable.jsx
import React, { useState, useMemo } from "react";
import { format, startOfWeek } from "date-fns";
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

import Pagination from "./Pagination";
import { useCurrency } from "../hooks/useCurrency";
import { computeKPIs } from "../utils/computeKPIs";
import ProductTrendsModal from "./ProductTrendsModal";

const TrendIcon = ({ direction }) => {
  if (direction === "up") return <TrendingUp className="w-4 h-4 text-green-600" />;
  if (direction === "down") return <TrendingDown className="w-4 h-4 text-red-600" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

function aggregateSales(data, period = "daily") {
  const grouped = {};

  data.forEach(sale => {
    let periodKey;
    const date = new Date(sale.soldAt);

    if (period === "daily") periodKey = format(date, "yyyy-MM-dd");
    else if (period === "weekly") periodKey = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
    else if (period === "monthly") periodKey = format(date, "yyyy-MM");

    const key = `${sale.productId}-${periodKey}`;
    if (!grouped[key]) {
      grouped[key] = {
        productId: sale.productId,
        productName: sale.productName,
        productUrl: sale.productUrl,
        dateKey: periodKey,
        displayDate: period === "daily" ? format(date, "MMM d, yyyy") :
                     period === "weekly" ? `Week of ${format(date, "MMM d")}` :
                     format(date, "MMMM yyyy"),
        quantity: 0,
        totalSales: 0,
        unitPrice: sale.unitPrice,
      };
    }

    grouped[key].quantity += sale.quantity;
    grouped[key].totalSales += sale.totalSales;
  });

  return Object.values(grouped).sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey));
}

export default function SalesTable({ data = [] }) {
  const { formatCurrency } = useCurrency();
  const [isVisible, setIsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("daily");

  const aggregatedData = useMemo(() => aggregateSales(data, filterPeriod), [data, filterPeriod]);
  const { productMetrics = {} } = useMemo(() => computeKPIs(data), [data]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(aggregatedData.length / itemsPerPage);
  const currentData = aggregatedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openProductModal = (productId) => {
    setSelectedProductId(productId);
    setModalOpen(true);
  };

  const closeProductModal = () => {
    setModalOpen(false);
    setSelectedProductId(null);
  };

  const recentTransactions = selectedProductId
    ? data.filter(d => d.productId === selectedProductId)
    : [];
  const selectedMetric = selectedProductId ? productMetrics[selectedProductId] : null;

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        No sales recorded yet.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-pink-900/20 rounded-2xl shadow-xl border border-indigo-200 dark:border-indigo-800">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-400">
          Sales Transactions
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <select
            value={filterPeriod}
            onChange={(e) => {
              setFilterPeriod(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <button
            onClick={() => setIsVisible(!isVisible)}
            className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg w-full sm:w-auto
              ${isVisible
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
              }`}
          >
            {isVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            <span>{isVisible ? 'Hide' : 'View'} Sales</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isVisible ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-4">
          {currentData.map((sale) => {
            const pm = productMetrics[sale.productId] || {};
            const trendDir = pm.amountMoMDirection || 'neutral';
            const trendPercent = pm.amountMoMPercent || 0;

            return (
              <motion.div
                key={`${sale.productId}-${sale.dateKey}`}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 cursor-pointer"
                onClick={() => openProductModal(sale.productId)}
              >
                {/* Mobile & Desktop Layout */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left: Product Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        <a
                          href={sale.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline break-words"
                        >
                          {sale.productName}
                        </a>
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{sale.displayDate}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <TrendIcon direction={trendDir} />
                          <span className={`font-medium ${
                            trendDir === 'up' ? 'text-green-600' :
                            trendDir === 'down' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {trendPercent ? `${Math.abs(trendPercent).toFixed(1)}% MoM` : 'No trend'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Sales Metrics - Stacked on mobile, side-by-side on lg+ */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-8 lg:gap-12">
                    <div className="text-center sm:text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Quantity Sold</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {sale.quantity}
                      </p>
                    </div>

                    <div className="text-center sm:text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {formatCurrency(sale.totalSales)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        @ {formatCurrency(sale.unitPrice)} each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile hint */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 lg:hidden text-center text-sm text-slate-500">
                  Tap card for trend details →
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageCount={totalPages}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Hidden Hint */}
      {!isVisible && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>Sales table is hidden. Click the eye icon to view {aggregatedData.length} transactions.</p>
        </div>
      )}

      {/* Product Trends Modal */}
      <ProductTrendsModal
        open={modalOpen}
        onClose={closeProductModal}
        productMetric={selectedMetric}
        recentTransactions={recentTransactions}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}