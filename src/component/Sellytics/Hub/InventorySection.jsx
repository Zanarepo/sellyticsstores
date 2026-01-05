import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  Loader2,
  Edit2,
  Store,
  MoreVertical,
  Trash2,
} from "lucide-react";

/* ---------------------------------------------
   Small reusable dropdown (enterprise-safe)
--------------------------------------------- */
function RowMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left ">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-slate-100"
      >
        <MoreVertical className="w-4 h-4 text-slate-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-slate-50"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function InventorySection({
  isInternal,
  searchQuery,
  setSearchQuery,
  filteredInventory,
  productsLoading,
  inventoryLoading,
  formatPrice,
  productModal,
}) {
  const confirmDelete = (product) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${product.product_name}"?\n\nThis action cannot be undone.`
      )
    ) {
      productModal.deleteProduct(product);
    }
  };

  return (
    <motion.div
      key="inventory"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {isInternal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200  dark:bg-slate-950 dark:text-white"
        >
          <div className="flex items-start gap-3 ">
            <Store className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-emerald-900 ">Your Company Store</p>
              <p className="text-sm text-emerald-700">
                Manage internal inventory with full control.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-slate-200  dark:bg-slate-950 dark:text-white">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4  dark:bg-slate-950 dark:text-white">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900  dark:bg-slate-950 dark:text-white">
              Current Inventory
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <button
                onClick={() => productModal.open()}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {productsLoading || inventoryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No inventory found</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-left px-4 py-3">SKU</th>
                      <th className="text-left px-4 py-3">Type</th>
                      <th className="text-right px-4 py-3">Qty</th>
                      <th className="text-right px-4 py-3">Avail</th>
                      <th className="text-right px-4 py-3">Damaged</th>
                      <th className="text-right px-4 py-3">Cost</th>
                      <th className="text-right px-4 py-3">Value</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 text-gray-500">
                        <td className="px-4 py-4 font-medium">
                          {item.product.product_name}
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          {item.product.sku || "-"}
                        </td>
                        <td className="px-4 py-4">{item.product.product_type}</td>
                        <td className="px-4 py-4 text-right">{item.quantity || 0}</td>
                        <td className="px-4 py-4 text-right text-emerald-600">
                          {item.available_qty || 0}
                        </td>
                        <td className="px-4 py-4 text-right text-rose-600">
                          {item.damaged_qty || 0}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {item.unit_cost ? formatPrice(item.unit_cost) : "-"}
                        </td>
                        <td className="px-4 py-4 text-right text-indigo-600">
                          {item.total_cost ? formatPrice(item.total_cost) : "-"}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <RowMenu
                            onEdit={() => productModal.open(item.product, item)}
                            onDelete={() => confirmDelete(item.product)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>




              {/* MOBILE CARDS */}
              <div className="lg:hidden space-y-4  dark:bg-slate-950 dark:text-white">
                {filteredInventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 rounded-xl border p-4  dark:bg-slate-950 dark:text-white"
                  >
                    <div className="flex justify-between items-start ">
                      <h3 className="font-semibold">
                        {item.product.product_name}
                      </h3>
                      <RowMenu
                        onEdit={() => productModal.open(item.product, item)}
                        onDelete={() => confirmDelete(item.product)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <div>Qty: {item.quantity || 0}</div>
                      <div className="text-emerald-600">
                        Avail: {item.available_qty || 0}
                      </div>
                      <div className="text-rose-600">
                        Damaged: {item.damaged_qty || 0}
                      </div>
                      <div>
                        Cost:{" "}
                        {item.unit_cost ? formatPrice(item.unit_cost) : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
