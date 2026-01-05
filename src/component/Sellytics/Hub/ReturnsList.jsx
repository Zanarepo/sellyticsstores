// ReturnsList.jsx
import React from "react";
import { motion } from "framer-motion";
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
    label: "Pending Inspection",
    color: "amber",
    icon: () => <Clock className="w-3 h-3" />,
  },
  APPROVED: {
    label: "Approved",
    color: "emerald",
    icon: () => <CheckCircle2 className="w-3 h-3" />,
  },
  QUARANTINED: {
    label: "Quarantined",
    color: "orange",
    icon: () => <AlertTriangle className="w-3 h-3" />,
  },
  default: {
    label: "Unknown",
    color: "gray",
    icon: () => <AlertTriangle className="w-3 h-3" />, // fallback icon
  },
};

export default function ReturnsList({ returns, loading, onInspect }) {
  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

  if (returns.length === 0)
    return <div className="text-center py-16 text-slate-500">No returns found</div>;

  return (
    <div className="space-y-4">
      {returns.map((item) => {
        const status = RETURN_STATUSES[item.status] || RETURN_STATUSES.default;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onInspect(item)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition hover:shadow-md ${
              item.status === "PENDING"
                ? "border-amber-200 bg-amber-50/50"
                : "border-slate-100 bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    item.status === "PENDING" ? "bg-amber-100" : "bg-slate-100"
                  }`}
                >
                  <RotateCcw
                    className={`w-5 h-5 ${
                      item.status === "PENDING" ? "text-amber-600" : "text-slate-600"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold">
                    {item.product?.product_name || "Unknown Product"}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    From: {item.client?.client_name || "Unknown"} • Qty: {item.quantity}
                  </p>
                  {item.reason && (
                    <p className="text-sm text-slate-600 mt-2 italic">"{item.reason}"</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700 border border-${status.color}-200`}
                >
                  {status.icon()}
                  {status.label}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Returned: {new Date(item.created_at).toLocaleDateString()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}