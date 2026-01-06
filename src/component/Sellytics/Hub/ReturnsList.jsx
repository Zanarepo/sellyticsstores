// ReturnsList.jsx - Ultra Compact & Sleek Version
import React from "react";
import {
  RotateCcw,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";

const RETURN_STATUSES = {
  PENDING: {
    label: "Pending",
    color: "amber",
    bgClass: "bg-amber-100 dark:bg-amber-900/30",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-200 dark:border-amber-800",
    cardBgClass: "bg-amber-50/50 dark:bg-amber-900/10",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    color: "emerald",
    bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    cardBgClass: "bg-white dark:bg-slate-800",
    icon: CheckCircle2,
  },
  QUARANTINED: {
    label: "Quarantined",
    color: "orange",
    bgClass: "bg-orange-100 dark:bg-orange-900/30",
    textClass: "text-orange-700 dark:text-orange-400",
    borderClass: "border-orange-200 dark:border-orange-800",
    cardBgClass: "bg-white dark:bg-slate-800",
    icon: AlertTriangle,
  },
  default: {
    label: "Unknown",
    color: "gray",
    bgClass: "bg-gray-100 dark:bg-gray-900/30",
    textClass: "text-gray-700 dark:text-gray-400",
    borderClass: "border-gray-200 dark:border-gray-800",
    cardBgClass: "bg-white dark:bg-slate-800",
    icon: AlertTriangle,
  },
};

export default function ReturnsList({ returns, loading, onInspect }) {
  if (loading)
    return (
      <div className="flex justify-center py-8 sm:py-10">
        <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-indigo-600" />
      </div>
    );

  if (returns.length === 0)
    return (
      <div className="text-center py-12 sm:py-16 text-slate-500 dark:text-slate-400 text-sm">
        No returns found
      </div>
    );

  return (
    <div className="space-y-2">
      {returns.map((item) => {
        const status = RETURN_STATUSES[item.status] || RETURN_STATUSES.default;
        const StatusIcon = status.icon;

        return (
          <div
            key={item.id}
            onClick={() => onInspect(item)}
            className={`
              p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all 
              hover:shadow-md active:scale-[0.99]
              ${item.status === "PENDING" 
                ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10" 
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              }
            `}
          >
            {/* Main Content */}
            <div className="flex justify-between items-start gap-2">
              {/* Left: Icon + Info */}
              <div className="flex items-start gap-2 sm:gap-2.5 flex-1 min-w-0">
                <div
                  className={`
                    p-1.5 sm:p-2 rounded-lg flex-shrink-0
                    ${item.status === "PENDING" 
                      ? "bg-amber-100 dark:bg-amber-900/30" 
                      : "bg-slate-100 dark:bg-slate-700"
                    }
                  `}
                >
                  <RotateCcw
                    className={`
                      w-4 h-4 sm:w-4.5 sm:h-4.5
                      ${item.status === "PENDING" 
                        ? "text-amber-600 dark:text-amber-400" 
                        : "text-slate-600 dark:text-slate-400"
                      }
                    `}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {item.product?.product_name || "Unknown Product"}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.client?.client_name || "Unknown"} • Qty: {item.quantity}
                  </p>
                  {item.reason && (
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 italic line-clamp-1">
                      "{item.reason}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Status Badge + Arrow */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <span
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-full 
                    text-[9px] sm:text-[10px] font-medium whitespace-nowrap
                    ${status.bgClass} ${status.textClass} ${status.borderClass} border
                  `}
                >
                  <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                  <span className="hidden xs:inline">{status.label}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              </div>
            </div>

            {/* Footer: Date */}
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400">
              Returned: {new Date(item.created_at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}