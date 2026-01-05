// ConfirmTransferModal.jsx - Updated for Multi-Client Transfers
import React from "react";
import { Check, Loader2, Package, User, Store, ArrowRight } from "lucide-react";

export default function ConfirmTransferModal({
  show,
  onClose,
  selectedItems,
  totalItems,
  userStores,
  destinationStoreId,
  transferring,
  onConfirm,

  // NEW REQUIRED PROPS
  userWarehouses,
  sourceWarehouseId,
  warehouseClients,
  sourceClientId,
}) {
  if (!show) return null;

  // Look up display names
  const destinationStore = userStores.find(
    (s) => s.id.toString() === destinationStoreId
  );
  const sourceWarehouse = userWarehouses.find(
    (w) => w.id.toString() === sourceWarehouseId
  );
  const sourceClient = warehouseClients.find(
    (c) => c.id.toString() === sourceClientId
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <ArrowRight className="w-6 h-6 text-indigo-600" />
            Confirm Transfer
          </h3>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Transfer Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700">From</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Warehouse</p>
                    <p className="text-slate-600">
                      {sourceWarehouse?.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-slate-600">
                      {sourceClient
                        ? `${sourceClient.client_name}${
                            sourceClient.business_name
                              ? ` (${sourceClient.business_name})`
                              : ""
                          }`
                        : "—"}
                      {sourceClient?.client_type === "EXTERNAL" && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          External
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* To */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700">To</h4>
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Store</p>
                  <p className="text-slate-600">
                    {destinationStore?.shop_name || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <p className="font-medium mb-3">
              Transferring <strong>{totalItems}</strong> item{totalItems !== 1 ? "s" : ""}
            </p>
            <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {selectedItems.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No items selected</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {selectedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0"
                    >
                      <span className="truncate max-w-[220px]">{item.productName}</span>
                      <span className="font-medium text-slate-700">
                        × {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={transferring}
            className="px-5 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={
              transferring ||
              !sourceWarehouseId ||
              !sourceClientId ||
              !destinationStoreId ||
              selectedItems.length === 0
            }
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition"
          >
            {transferring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm Transfer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}