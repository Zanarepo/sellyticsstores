// ReturnsTabs.jsx - FIXED VERSION
import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";

export default function ReturnsTabs({ activeTab, setActiveTab, pendingCount }) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex flex-wrap gap-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
            activeTab === "pending"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setActiveTab("processed")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
            activeTab === "processed"   // ← FIXED: was "PENDING" !!!
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Processed
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
            activeTab === "all"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          All Returns
        </button>
      </div>
    </div>
  );
}