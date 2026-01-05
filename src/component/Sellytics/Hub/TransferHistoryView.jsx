// TransferHistoryView.jsx
import React from "react";
import { ArrowRight } from "lucide-react";

export default function TransferHistoryView({ transfers }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold">Recent Transfers</h3>
      </div>
      <div className="p-6">
        {transfers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No transfers yet</div>
        ) : (
          <div className="space-y-4">
            {transfers.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* Header: Destination, Date, Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <ArrowRight className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">→ {t.destination_store?.shop_name}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(t.created_at).toLocaleDateString()} &middot; <span className="italic">by {t.created_by || "Unknown"}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                {/* List transferred products */}
                {t.items?.length > 0 && (
                  <ul className="mt-3 ml-12 space-y-1 text-sm text-slate-600">
                    {t.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{it.product?.product_name || "Unknown Product"}</span>
                        <span className="font-medium">{it.quantity} pcs</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
