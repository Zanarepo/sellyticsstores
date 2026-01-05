// src/components/stockTransfer/TransferDetailsModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const CURRENCY_STORAGE_KEY = "preferred_currency";

const SUPPORTED_CURRENCIES = [
  { code: "NGN", symbol: "₦", name: "Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "Pound Sterling" },
];

/* ---------------- Currency Hooks ---------------- */

const useCurrencyFormatter = (currency) =>
  useCallback(
    (value) => {
      const num = Number(value);
      if (isNaN(num)) return `${currency.symbol}0`;

      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency.code,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(num);
      } catch {
        return `${currency.symbol}${num.toLocaleString()}`;
      }
    },
    [currency]
  );

const usePreferredCurrency = () => {
  const getInitialCurrency = () => {
    if (typeof window === "undefined") return SUPPORTED_CURRENCIES[0];
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return (
      SUPPORTED_CURRENCIES.find((c) => c.code === stored) ||
      SUPPORTED_CURRENCIES.find((c) => c.code === "NGN") ||
      SUPPORTED_CURRENCIES[0]
    );
  };

  const [preferredCurrency, setPreferredCurrency] = useState(getInitialCurrency);

  useEffect(() => {
    setPreferredCurrency(getInitialCurrency());
  }, []);

  return preferredCurrency;
};

/* ---------------- Modal ---------------- */

export default function TransferDetailsModal({ open, onClose, transfer }) {
  const preferredCurrency = usePreferredCurrency();
  const formatPrice = useCurrencyFormatter(preferredCurrency);

  if (!open || !transfer) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="
            bg-white dark:bg-slate-900
            rounded-2xl shadow-2xl
            max-w-3xl w-full
            max-h-[90vh] overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Transfer Details
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Reference #{transfer.id}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Quantity
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {transfer.quantity}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Worth
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatPrice(transfer.worth)}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Status
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white uppercase">
                  {transfer.status}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Requested At
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {new Date(transfer.requested_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
            <button
              onClick={onClose}
              className="
                w-full px-6 py-3
                bg-gradient-to-r from-indigo-600 to-indigo-700
                hover:from-indigo-700 hover:to-indigo-800
                text-white rounded-xl font-medium
                shadow-lg shadow-indigo-500/30
                transition-all
              "
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
