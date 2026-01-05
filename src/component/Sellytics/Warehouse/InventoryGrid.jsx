import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  ArrowUpCircle,

  AlertTriangle,
  Barcode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryGrid({ 
  inventory = [], 
  products = [],
  onViewProduct,
  onDispatch,
  onAdjust,
  onViewSerials
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const enrichedInventory = inventory.map(inv => {
    const product = products.find(p => p.id === inv.warehouse_product_id);
    return { ...inv, product };
  });

  const filteredInventory = enrichedInventory
    .filter(inv => {
      const matchesSearch = 
        inv.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'low' && inv.quantity <= 10) ||
        (filterStatus === 'out' && inv.available_qty === 0) ||
        (filterStatus === 'damaged' && inv.damaged_qty > 0);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

  const totalStock = enrichedInventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
  const totalProducts = enrichedInventory.length;
  const lowStockCount = enrichedInventory.filter(inv => inv.quantity <= 10).length;
  const totalAvailable = enrichedInventory.reduce((sum, inv) => sum + (inv.available_qty || 0), 0);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-400" />
              Current Inventory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {totalProducts} products • {totalStock.toLocaleString()} total units
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            
            {/* Filter Select */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none rounded-lg border border-slate-300 pl-10 pr-8 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="all">All Status</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
                <option value="damaged">Has Damaged</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-xs text-slate-500">Total Stock</p>
            <p className="text-2xl font-bold text-slate-900">{totalStock.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50">
            <p className="text-xs text-emerald-600">Available</p>
            <p className="text-2xl font-bold text-emerald-700">{totalAvailable.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50">
            <p className="text-xs text-amber-600">Low Stock</p>
            <p className="text-2xl font-bold text-amber-700">{lowStockCount}</p>
          </div>
        </div>
      </div>
      
      {/* Table Content */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700">Product</th>
                <th className="text-center py-3 px-4 font-medium text-slate-700">Status</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700">Total</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700">Available</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700">Damaged</th>
                <th className="w-12 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-slate-500">
                      <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No inventory found</p>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((inv) => {
                    const availablePercent = inv.quantity > 0 
                      ? Math.round((inv.available_qty / inv.quantity) * 100) 
                      : 0;
                    const isLowStock = inv.quantity <= 10;
                    const isOutOfStock = inv.available_qty === 0;

                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {inv.product?.product_name || 'Unknown Product'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {inv.product?.sku && (
                                  <span className="text-xs text-slate-500 font-mono">
                                    {inv.product.sku}
                                  </span>
                                )}
                                {inv.product?.is_serialized && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                                    <Barcode className="h-3 w-3" />
                                    Serialized
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="space-y-2">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                Out of Stock
                              </span>
                            ) : isLowStock ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                                <AlertTriangle className="h-3 w-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                                In Stock
                              </span>
                            )}
                            <div className="h-2 w-24 mx-auto bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${availablePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right font-semibold text-slate-900">
                          {inv.quantity?.toLocaleString() || 0}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span className={isOutOfStock ? 'text-red-600 font-medium' : 'text-emerald-600 font-medium'}>
                            {inv.available_qty?.toLocaleString() || 0}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          {inv.damaged_qty > 0 ? (
                            <span className="text-red-600 font-medium">{inv.damaged_qty}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {/* Dropdown Menu */}
                          <div className="relative inline-block text-left">
                            <button
                              className="p-1.5 rounded-md hover:bg-slate-100 transition"
                              onClick={(e) => {
                                const menu = e.currentTarget.nextElementSibling;
                                menu.classList.toggle('hidden');
                              }}
                            >
                              <MoreVertical className="h-4 w-4 text-slate-600" />
                            </button>

                            <div className="absolute right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-slate-200 hidden z-10">
                              <button
                                onClick={() => onViewProduct?.(inv)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>

                              {inv.product?.is_serialized && (
                                <button
                                  onClick={() => onViewSerials?.(inv)}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition"
                                >
                                  <Barcode className="h-4 w-4" />
                                  View Serials
                                </button>
                              )}

                              <button
                                onClick={() => onDispatch?.(inv)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition"
                              >
                                <ArrowUpCircle className="h-4 w-4" />
                                Dispatch
                              </button>

                              <button
                                onClick={() => onAdjust?.(inv)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition"
                              >
                                <Edit className="h-4 w-4" />
                                Adjust Stock
                              </button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}