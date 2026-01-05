/**
 * SwiftCheckout - Checkout Form
 * Main sales form with product lines and device tracking
 * @version 2.0.0
 */
import React from 'react';
import { 
  X, Plus, Trash2, Scan, Package, Hash, 
  CreditCard, User, Mail, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutForm({
  lines,
  products,
  inventory,
  customers,
  paymentMethod,
  selectedCustomerId,
  emailReceipt,
  totalAmount,
  isOnline,
  isSubmitting,
  onProductChange,
  onQuantityChange,
  onPriceChange,
  onAddDeviceRow,
  onUpdateDeviceRow,
  onRemoveDeviceRow,
  onConfirmDeviceRow,
  onAddLine,
  onRemoveLine,
  onPaymentMethodChange,
  onCustomerChange,
  onEmailReceiptChange,
  onOpenScanner,
  onSubmit,
  onCancel,
  formatPrice
}) {
  const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'Wallet'];

  const getInventoryQty = (productId) => {
    if (!productId) return null;
    const inv = inventory.find(i => i.dynamic_product_id === productId);
    return inv?.available_qty ?? null;
  };

  const getInventoryWarning = (productId) => {
    const qty = getInventoryQty(productId);
    if (qty === null) return null;
    if (qty === 0) return { type: 'error', message: 'Out of stock' };
    if (qty <= 6) return { type: 'warning', message: `Low stock: ${qty} left` };
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                New Sale
              </h2>
              <p className="text-xs text-slate-500">
                {isOnline ? '🟢 Online' : '🟠 Offline - will sync later'}
              </p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Product Lines */}
          <AnimatePresence>
            {lines.map((line, lineIndex) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3"
              >
                {/* Product Selection */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-medium text-slate-500">
                      Product #{lineIndex + 1}
                    </label>
                    <select
                      value={line.dynamic_product_id || ''}
                      onChange={(e) => onProductChange(line.id, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatPrice(p.selling_price)}
                        </option>
                      ))}
                    </select>

                    {/* Inventory Warning */}
                    {line.dynamic_product_id && getInventoryWarning(line.dynamic_product_id) && (
                      <div className={`text-xs px-2 py-1 rounded ${
                        getInventoryWarning(line.dynamic_product_id).type === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {getInventoryWarning(line.dynamic_product_id).message}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenScanner(line.id)}
                      className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                      title="Scan barcode"
                    >
                      <Scan className="w-4 h-4" />
                    </button>
                    
                    {lines.length > 1 && (
                      <button
                        onClick={() => onRemoveLine(line.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Remove line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quantity & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => onQuantityChange(line.id, parseInt(e.target.value) || 1)}
                      disabled={line.isUnique}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Unit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) => onPriceChange(line.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
                    />
                  </div>
                </div>

                {/* Device IDs (for unique products) */}
                {(line.isUnique || line.deviceRows?.some(r => r.deviceId)) && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Device IDs / IMEIs
                      </label>
                      <button
                        onClick={() => onAddDeviceRow(line.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        + Add ID
                      </button>
                    </div>

                    {(line.deviceRows || []).map((row, rowIndex) => (
                      <div key={row.key} className="flex gap-2">
                        <input
                          type="text"
                          value={row.deviceId}
                          onChange={(e) => onUpdateDeviceRow(line.id, row.key, { deviceId: e.target.value })}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              onConfirmDeviceRow(line.id, row.key, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              onConfirmDeviceRow(line.id, row.key, e.target.value);
                            }
                          }}
                          placeholder={`Device ID #${rowIndex + 1}`}
                          className={`flex-1 px-3 py-1.5 text-sm border rounded-lg bg-white dark:bg-slate-900 ${
                            row.isScanned 
                              ? 'border-emerald-300 bg-emerald-50' 
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        />
                        <input
                          type="text"
                          value={row.deviceSize || ''}
                          onChange={(e) => onUpdateDeviceRow(line.id, row.key, { deviceSize: e.target.value })}
                          placeholder="Size"
                          className="w-20 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                        />
                        <button
                          onClick={() => onRemoveDeviceRow(line.id, row.key)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Line Total */}
                <div className="flex justify-end text-sm font-medium text-slate-700 dark:text-slate-300">
                  Subtotal: {formatPrice(line.quantity * line.unit_price)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Line Button */}
          <button
            onClick={onAddLine}
            className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Product
          </button>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method}
                  onClick={() => onPaymentMethodChange(method)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    paymentMethod === method
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              Customer (Optional)
            </label>
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => {
                const customerId = e.target.value ? Number(e.target.value) : null;
                onCustomerChange(customerId);
              }}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm"
            >
              <option value="">Walk-in Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullname} {c.email ? `(${c.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Email Receipt */}
          {selectedCustomerId && (
            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={emailReceipt}
                onChange={(e) => onEmailReceiptChange(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-500" />
                Send email receipt
              </div>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
          {/* Total */}
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-slate-700 dark:text-slate-300">Total</span>
            <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
              {formatPrice(totalAmount)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting || totalAmount === 0}
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}