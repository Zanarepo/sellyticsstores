// TransferTabs.jsx
import React from "react";

export default function TransferTabs({ activeTab, setActiveTab }) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex gap-8">
        <button
          onClick={() => setActiveTab("new")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "new"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          New Transfer
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === "history"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Transfer History
        </button>
      </div>
    </div>
  );
}