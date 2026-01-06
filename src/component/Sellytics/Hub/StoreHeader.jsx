// components/StoreWorkspace/StoreHeader.jsx
import React from "react";
import { ArrowLeft, Store, Building2 } from "lucide-react";
import StatsCards from "./StatsCards";
import TabNavigation from "./TabNavigation";

export default function StoreHeader({
  store,
  onBack,
  totalStock,
  availableStock,
  totalInventoryValue,
  activeTab,
  setActiveTab,
}) {
  const isInternal = store.client_type === "SELLYTICS_STORE";

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
        {/* Top Row: Back + Store Info + Stats */}
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
          </button>

          {/* Store Icon + Info */}
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div
              className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                isInternal 
                  ? "bg-emerald-100 dark:bg-emerald-900/30" 
                  : "bg-slate-100 dark:bg-slate-700"
              }`}
            >
              {isInternal ? (
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {store.client_name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border flex-shrink-0 ${
                    isInternal
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600"
                  }`}
                >
                  {isInternal ? "Internal" : "External"}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {store.business_name || store.email || "Warehouse inventory"}
              </p>
            </div>
          </div>

          {/* Stats Cards - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block flex-shrink-0">
            <StatsCards
              totalStock={totalStock}
              availableStock={availableStock}
              totalValue={totalInventoryValue}
              compact={true}
            />
          </div>
        </div>

        {/* Stats Cards - Mobile Only (Below store info) */}
        <div className="md:hidden mt-2">
          <StatsCards
            totalStock={totalStock}
            availableStock={availableStock}
            totalValue={totalInventoryValue}
            compact={true}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mt-2 sm:mt-3">
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isInternal={false}
          />
        </div>
      </div>
    </header>
  );
}