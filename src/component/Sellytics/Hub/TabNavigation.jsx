// components/TabNavigation.jsx
import { Package, ArrowDownLeft, ArrowUpRight, History } from "lucide-react";

export default function TabNavigation({ activeTab, setActiveTab, isInternal }) {
  const tabs = [
    {
      key: "inventory",
      label: "Inventory",
      icon: <Package className="w-5 h-5" />,
    },
    // Only show Stock In & Dispatch for external clients (when !isInternal)
    ...(isInternal
      ? []
      : [
          {
            key: "stock-in",
            label: "Stock In",
            icon: <ArrowDownLeft className="w-5 h-5" />,
          },
          {
            key: "dispatch",
            label: "Dispatch",
            icon: <ArrowUpRight className="w-5 h-5" />,
          },
        ]),
    {
      key: "history",
      label: "History",
      icon: <History className="w-5 h-5" />,
    },

  ];

  return (
    <>
      {/* Desktop/Tablet: Classic underline tabs */}
      <div className="hidden sm:block mt-6 border-b border-slate-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Horizontal scrollable pill-style tabs */}
      <div className="sm:hidden mt-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-3 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Optional: Hide scrollbar on mobile */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}