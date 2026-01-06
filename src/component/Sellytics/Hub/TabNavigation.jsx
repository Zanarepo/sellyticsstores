// components/TabNavigation.jsx - Ultra Sleek & Compact
import React from "react";
import { Package, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";

export default function TabNavigation({ activeTab, setActiveTab, isInternal }) {
  const tabs = [
    {
      key: "inventory",
      label: "Inventory",
      icon: Package,
      shortLabel: "Items",
    },
    // Only show Stock In & Dispatch for external clients
    ...(isInternal
      ? []
      : [
          {
            key: "stock-in",
            label: "Stock In",
            icon: ArrowDownLeft,
            shortLabel: "In",
          },
          {
            key: "dispatch",
            label: "Dispatch",
            icon: ArrowUpRight,
            shortLabel: "Out",
          },
        ]),
    {
      key: "history",
      label: "History",
      icon: History,
      shortLabel: "Log",
    },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      {/* Unified Horizontal Scroll Design - Works on All Screens */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 
                  rounded-t-lg font-medium text-xs sm:text-sm 
                  transition-all duration-200 whitespace-nowrap
                  border-b-2 -mb-px relative
                  ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                
                {/* Full label on larger screens */}
                <span className="hidden sm:inline">{tab.label}</span>
                
                {/* Short label on mobile */}
                <span className="sm:hidden">{tab.shortLabel}</span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hide scrollbar - Using Tailwind approach */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}