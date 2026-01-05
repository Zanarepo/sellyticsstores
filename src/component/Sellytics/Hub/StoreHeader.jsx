// components/StoreWorkspace/StoreHeader.jsx
import React from "react";
import { ArrowLeft, Store, Building2 } from "lucide-react";
import StatsCards from "./StatsCards"; // adjust if needed
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50  dark:bg-slate-950 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                isInternal ? "bg-emerald-100" : "bg-slate-100"
              }`}
            >
              {isInternal ? (
                <Store className="w-6 h-6 text-emerald-600 " />
              ) : (
                <Building2 className="w-6 h-6 text-slate-600" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate  dark:bg-slate-950 dark:text-white">
                  {store.client_name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    isInternal
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {isInternal ? "Internal Store" : "External Client"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 truncate">
                {store.business_name || store.email || "Warehouse-managed inventory"}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <StatsCards
              totalStock={totalStock}
              availableStock={availableStock}
              totalValue={totalInventoryValue}
            />
          </div>
        </div>

        <div className="mt-4">
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