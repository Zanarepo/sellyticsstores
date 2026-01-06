// ReturnsTabs.jsx - Compact & Sleek Version
import React from "react";
import { Clock, CheckCircle2, Package } from "lucide-react";

export default function ReturnsTabs({ activeTab, setActiveTab, pendingCount }) {
  const tabs = [
    { id: "pending", label: "Pending", icon: Clock, count: pendingCount },
    { id: "processed", label: "Processed", icon: CheckCircle2 },
    { id: "all", label: "All", icon: Package },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 
              border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
              transition-all active:scale-95 flex-shrink-0
              ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }
            `}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`
                px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}