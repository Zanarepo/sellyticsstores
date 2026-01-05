// NewTransferView.jsx - Updated with Warehouse Client Selection
import React from "react";
import { Package, Search, ArrowRight, Plus, Minus, Trash2, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function NewTransferView({
  userWarehouses,
  sourceWarehouseId,
  setSourceWarehouseId,
  warehouseClients,         // NEW: clients for selected warehouse
  sourceClientId,           // NEW
  setSourceClientId,        // NEW
  userStores,
  destinationStoreId,
  setDestinationStoreId,
  filteredProducts,
  loading,
  selectedItems,
  totalItems,
  searchQuery,
  setSearchQuery,
  addToTransfer,
  updateQuantity,
  removeFromTransfer,
  setShowConfirmModal,
}) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Available Products */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Available Inventory
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {sourceClientId
                ? "No products in stock for this client"
                : sourceWarehouseId
                ? "Select a client to view inventory"
                : "Select a warehouse first"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((item) => {
                const p = item.warehouse_product_id;
                const selected = selectedItems.find((i) => i.productId === p.id);

                return (
                  <motion.div
                    key={item.id}
                    onClick={() => addToTransfer(item)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                      selected
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{p.product_name}</h4>
                        <div className="text-xs text-slate-500 mt-1">
                          {p.sku && `SKU: ${p.sku} • `}
                          {p.product_type}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{item.available_qty}</p>
                        <p className="text-xs text-slate-500">available</p>
                        {selected && (
                          <span className="inline-block mt-1 px-3 py-1 bg-indigo-600 text-white text-xs rounded-full">
                            {selected.quantity} selected
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Transfer Cart
            </h3>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {totalItems} items
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Source Warehouse */}
          <div>
            <label className="block text-sm font-medium mb-2">Source Warehouse</label>
            <select
              value={sourceWarehouseId}
              onChange={(e) => {
                setSourceWarehouseId(e.target.value);
                setSourceClientId(""); // Reset client when warehouse changes
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select warehouse...</option>
              {(userWarehouses ?? []).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Client */}
          <div>
            <label className="block text-sm font-medium mb-2">Source Client</label>
            <select
              value={sourceClientId}
              onChange={(e) => setSourceClientId(e.target.value)}
              disabled={!sourceWarehouseId}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {sourceWarehouseId ? "Select client..." : "Select warehouse first"}
              </option>
              {(warehouseClients ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.client_name}
                  {client.business_name && ` (${client.business_name})`}
                  {client.client_type === "EXTERNAL" && " [External]"}
                  {client.client_type === "SELLYTICS_STORE" && " [Store]"}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Store */}
          <div>
            <label className="block text-sm font-medium mb-2">Destination Store</label>
            <select
              value={destinationStoreId}
              onChange={(e) => setDestinationStoreId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select store...</option>
              {(userStores ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shop_name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedItems.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">
                Click products to add
              </p>
            ) : (
              selectedItems.map((item) => (
                <div key={item.productId} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium truncate pr-2">
                      {item.productName}
                    </span>
                    <button onClick={() => removeFromTransfer(item.productId)}>
                      <Trash2 className="w-4 h-4 text-rose-600 hover:text-rose-700" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Max: {item.maxQuantity}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 border rounded flex items-center justify-center disabled:opacity-50 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        disabled={item.quantity >= item.maxQuantity}
                        className="w-7 h-7 border rounded flex items-center justify-center disabled:opacity-50 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Transfer Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={
              !sourceWarehouseId ||
              !sourceClientId ||
              !destinationStoreId ||
              selectedItems.length === 0
            }
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" />
            Transfer {totalItems} Items
          </button>
        </div>
      </div>
    </div>
  );
}