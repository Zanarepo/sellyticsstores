/**
 * Recommendation Row Card (TheftCard-style, 1 per row)
 */
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Calendar,
  TrendingUp,
  MoreVertical,
  Trash2,
} from "lucide-react";

export default function RecommendationCard({ recommendation, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const isRestock = recommendation.recommendation
    .toLowerCase()
    .includes("restock");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleDelete = () => {
    if (
      window.confirm(
        `Delete recommendation for "${recommendation.product_name}"?`
      )
    ) {
      onDelete(recommendation.id, recommendation.product_name);
      setShowMenu(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4">
        {/* Left Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isRestock
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-emerald-100 dark:bg-emerald-900/30"
          }`}
        >
          <Package
            className={`w-6 h-6 ${
              isRestock
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {recommendation.product_name}
          </h3>

          {/* Recommendation Badge */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
              isRestock
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {recommendation.recommendation}
          </span>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(recommendation.month + "-01").toLocaleString(
                  "default",
                  { month: "short", year: "numeric" }
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-4 h-4" />
              <span>
                {recommendation.quantity_sold}{" "}
                <span className="text-xs">units sold</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div
          className="relative flex-shrink-0 self-end sm:self-center"
          ref={menuRef}
        >
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-10"
              >
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
