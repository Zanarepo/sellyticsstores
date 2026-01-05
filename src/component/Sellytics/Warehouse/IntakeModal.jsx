import React, { useState } from 'react';
import { 
  Loader2, 
  PackagePlus, 
  Scan, 
  Plus, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntakeModal({
  open,
  onClose,
  onSubmit,
  onOpenScanner,
  clients = [],
  products = [],
  scannedItems = [],
  isLoading = false
}) {
  const [selectedClient, setSelectedClient] = useState('');
  const [notes, setNotes] = useState('');
  const [manualItems, setManualItems] = useState([]);
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    serial_numbers: ''
  });

  const allItems = [...scannedItems, ...manualItems];

  const addManualItem = () => {
    if (!newItem.product_id) return;
    
    const product = products.find(p => p.id === newItem.product_id);
    if (!product) return;

    const serials = newItem.serial_numbers
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    const quantity = product.is_serialized ? serials.length : parseInt(newItem.quantity || 1);

    setManualItems(prev => [...prev, {
      id: Date.now(),
      product,
      quantity,
      serial_numbers: serials,
      is_serialized: product.is_serialized
    }]);

    setNewItem({ product_id: '', quantity: 1, serial_numbers: '' });
  };

  const removeItem = (itemId) => {
    setManualItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSubmit = () => {
    if (!selectedClient || allItems.length === 0) return;
    
    onSubmit({
      client_id: selectedClient,
      items: allItems,
      notes
    });
  };

  const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
                <PackagePlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Stock Intake</h2>
                <p className="mt-0.5 text-sm text-slate-500">Receive goods into warehouse</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 transition hover:opacity-100"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Assign to Client *</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  [{client.client_type.replace('_', ' ')}] {client.external_name || `Store #${client.store_id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Scan Button */}
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-4 text-lg font-medium text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50"
          >
            <Scan className="h-5 w-5 text-indigo-500" />
            Open Scanner for Continuous Scanning
          </button>

          {/* Manual Entry */}
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <label className="block text-sm font-medium text-slate-700">Or Add Manually</label>
            <div className="grid grid-cols-12 gap-2">
              {/* Product Select */}
              <div className="col-span-5">
                <select
                  value={newItem.product_id}
                  onChange={(e) => setNewItem(prev => ({ ...prev, product_id: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.product_name} {product.is_serialized && '(Serial)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="Qty"
                  disabled={products.find(p => p.id === newItem.product_id)?.is_serialized}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>

              {/* Serial Numbers */}
              <div className="col-span-4">
                <input
                  type="text"
                  value={newItem.serial_numbers}
                  onChange={(e) => setNewItem(prev => ({ ...prev, serial_numbers: e.target.value }))}
                  placeholder="Serials (comma-separated)"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Add Button */}
              <div className="col-span-1">
                <button
                  onClick={addManualItem}
                  disabled={!newItem.product_id}
                  className="flex h-full w-full items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Items to Receive ({totalQuantity})
              </label>
              {allItems.some(i => i.needs_product_assignment) && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                  <AlertCircle className="h-3 w-3" />
                  Some items need assignment
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
              <div className="p-3">
                <AnimatePresence>
                  {allItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <PackagePlus className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p className="text-sm">No items added yet</p>
                    </div>
                  ) : (
                    allItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 last:mb-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {item.product?.product_name || item.serial_number || item.sku || 'Unknown Product'}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                              Qty: {item.quantity}
                            </span>
                            {item.is_serialized && item.serial_numbers?.length > 0 && (
                              <span className="text-xs text-slate-500">
                                {item.serial_numbers.length} serials
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-md p-1 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="PO number, supplier info, or other notes..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-row-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedClient || allItems.length === 0}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-medium text-white shadow-md transition hover:from-emerald-700 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4" />
                Receive {totalQuantity} Items
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}