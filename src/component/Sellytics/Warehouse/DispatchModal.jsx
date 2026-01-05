import React, { useState } from 'react';
import { 
  Loader2, 
  PackageMinus, 
  Scan, 
  Plus, 
  Trash2,
  Store,
  Building2,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DispatchModal({
  open,
  onClose,
  onSubmit,
  onOpenScanner,
  clients = [],
  inventory = [],
  scannedItems = [],
  isLoading = false
}) {
  const [selectedClient, setSelectedClient] = useState('');
  const [notes, setNotes] = useState('');
  const [manualItems, setManualItems] = useState([]);
  const [newItem, setNewItem] = useState({
    inventory_id: '',
    quantity: 1,
    serial_numbers: ''
  });

  const allItems = [...scannedItems, ...manualItems];
  const selectedClientData = clients.find(c => c.id === selectedClient);
  const isSellytics = selectedClientData?.client_type === 'SELLYTICS_STORE';

  const addManualItem = () => {
    if (!newItem.inventory_id) return;
    
    const inv = inventory.find(i => i.id === newItem.inventory_id);
    const serials = newItem.serial_numbers
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    const qty = inv?.product?.is_serialized ? serials.length : parseInt(newItem.quantity || 1);

    if (qty > inv?.available_qty) {
      alert('Cannot dispatch more than available quantity');
      return;
    }

    setManualItems(prev => [...prev, {
      id: Date.now(),
      inventory: inv,
      product: inv.product,
      quantity: qty,
      serial_numbers: serials,
      is_serialized: inv?.product?.is_serialized
    }]);

    setNewItem({ inventory_id: '', quantity: 1, serial_numbers: '' });
  };

  const removeItem = (itemId) => {
    setManualItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSubmit = () => {
    if (!selectedClient || allItems.length === 0) return;
    
    onSubmit({
      client_id: selectedClient,
      items: allItems,
      notes,
      sync_type: isSellytics ? 'AUTO_SYNC' : 'EMAIL_ONLY'
    });
  };

  const totalQuantity = allItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <PackageMinus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Dispatch Stock</h2>
              <p className="mt-0.5 text-sm text-slate-500">Send goods from warehouse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Dispatch To *</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Select destination...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.external_name || `Store #${client.store_id}`} — {client.client_type.replace('_', ' ')}
                </option>
              ))}
            </select>
            {/* Visual indicator below select */}
            {clients.map((client) => selectedClient === client.id && (
              <div key={client.id} className="mt-2 flex items-center gap-2 text-sm">
                {client.client_type === 'SELLYTICS_STORE' ? (
                  <Store className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Building2 className="h-4 w-4 text-slate-400" />
                )}
                <span className="font-medium">{client.external_name || `Store #${client.store_id}`}</span>
                <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs">
                  {client.client_type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>

          {/* Sync Type Indicator */}
          {selectedClient && (
            <div className={`rounded-lg border p-4 ${isSellytics ? 'border-indigo-200 bg-indigo-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className="flex items-center gap-2">
                {isSellytics ? (
                  <>
                    <Store className="h-4 w-4 text-indigo-600" />
                    <span className="text-indigo-700">
                      <strong>Auto-Sync:</strong> Inventory will be automatically updated in the store
                    </span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700">
                      <strong>Email Only:</strong> Client will receive email notification with dispatch details
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Scan Button */}
          <button
            type="button"
            onClick={onOpenScanner}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-4 text-lg font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50"
          >
            <Scan className="h-5 w-5 text-orange-500" />
            Open Scanner for Dispatch
          </button>

          {/* Manual Entry */}
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <label className="block text-sm font-medium text-slate-700">Or Select from Inventory</label>
            <div className="grid grid-cols-12 gap-2">
              {/* Product Select */}
              <div className="col-span-5">
                <select
                  value={newItem.inventory_id}
                  onChange={(e) => setNewItem(prev => ({ ...prev, inventory_id: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Product...</option>
                  {inventory.filter(i => i.available_qty > 0).map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.product?.product_name} ({inv.available_qty} available)
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="Qty"
                />
              </div>

              {/* Serial Numbers */}
              <div className="col-span-4">
                <input
                  type="text"
                  value={newItem.serial_numbers}
                  onChange={(e) => setNewItem(prev => ({ ...prev, serial_numbers: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="Serials (comma-separated)"
                />
              </div>

              {/* Add Button */}
              <div className="col-span-1">
                <button
                  onClick={addManualItem}
                  disabled={!newItem.inventory_id}
                  className="flex h-full w-full items-center justify-center rounded-md bg-orange-600 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Items to Dispatch ({totalQuantity})
            </label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
              <div className="p-3">
                <AnimatePresence>
                  {allItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <PackageMinus className="mx-auto mb-2 h-8 w-8 opacity-50" />
                      <p className="text-sm">No items selected</p>
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
                            {item.product?.product_name || item.inventory?.product?.product_name}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                              Qty: {item.quantity}
                            </span>
                            {item.serial_numbers?.length > 0 && (
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
            <label className="text-sm font-medium text-slate-700">Notes / Reference</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Delivery notes, reference number..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-row-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedClient || allItems.length === 0}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-medium text-white shadow-md transition hover:from-orange-700 hover:to-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <PackageMinus className="h-4 w-4" />
                Dispatch {totalQuantity} Items
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