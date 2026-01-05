/**
 * SwiftCheckout - Sales Form Component (Add/Edit Modal)
 */
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { X, Scan, Plus, Trash2, Package, DollarSign, CreditCard, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomerSelector from './CustomerSelector';
import { formatPrice } from '../SwiftCheckout/utils/formatting';
/**
 * SwiftCheckout - Sales Form Component (Add/Edit Modal)
 */

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Wallet'];

export default function SalesForm({
  type = 'add',
  onSubmit,
  onCancel,
  lines,
  setLines,
  removeLine,
  products = [],
  availableDeviceIds = {},
  handleLineChange,
  openScanner,
  removeDeviceId,
  addDeviceId,
  paymentMethod,
  setPaymentMethod,
  storeId,
  selectedCustomerId,
  setSelectedCustomerId,
  totalAmount,
  emailReceipt,
  setEmailReceipt,
  formatPrice: formatPriceProp,
  isOnline,
  saleForm,
  handleEditChange,
  addEditDeviceId,
  removeEditDeviceId,
  isOwner,
}) {
  const isAdd = type === 'add';
  const displayLines = isAdd ? lines : [saleForm];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isAdd ? 'New Sale' : 'Edit Sale'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isAdd ? 'Add products to create a sale' : 'Update sale details'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scanner Button (Add mode only) */}
          {isAdd && openScanner && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openScanner();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              <Scan className="w-5 h-5" />
              <span>Open Scanner</span>
            </button>
          )}

          {/* Lines */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Products
            </h3>

            {displayLines.map((line, lineIdx) => (
              <div key={lineIdx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
                {/* Product Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      Product
                    </label>
                    <select
                      value={line.dynamic_product_id || ''}
                      onChange={(e) => {
                        const handler = isAdd ? handleLineChange : handleEditChange;
                        handler(lineIdx, 'dynamic_product_id', e.target.value);
                      }}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity || 1}
                        onChange={(e) => {
                          const handler = isAdd ? handleLineChange : handleEditChange;
                          handler(lineIdx, 'quantity', e.target.value);
                        }}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unit_price || ''}
                        onChange={(e) => {
                          const handler = isAdd ? handleLineChange : handleEditChange;
                          handler(lineIdx, 'unit_price', e.target.value);
                        }}
                        className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Device IDs (for unique products) */}
                {line.dynamic_product_id && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Device IDs
                      </label>
                      <button
                        type="button"
                        onClick={(e) => {
                          const handler = isAdd ? addDeviceId : addEditDeviceId;
                          handler(e, lineIdx);
                        }}
                        className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                      >
                        + Add ID
                      </button>
                    </div>

                    <div className="grid gap-2">
                      {(line.deviceIds || ['']).map((deviceId, deviceIdx) => (
                        <div key={deviceIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={deviceId}
                            onChange={(e) => {
                              const handler = isAdd ? handleLineChange : handleEditChange;
                              handler(lineIdx, 'deviceIds', e.target.value, deviceIdx);
                            }}
                            onBlur={(e) => {
                              if (isAdd) {
                                handleLineChange(lineIdx, 'deviceIds', e.target.value, deviceIdx, true);
                              }
                            }}
                            placeholder="Enter device ID"
                            className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                          {deviceId && (
                            <input
                              type="text"
                              value={line.deviceSizes?.[deviceIdx] || ''}
                              onChange={(e) => {
                                const handler = isAdd ? handleLineChange : handleEditChange;
                                handler(lineIdx, 'deviceSizes', e.target.value, deviceIdx);
                              }}
                              placeholder="Size"
                              className="w-20 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                          )}
                          {(line.deviceIds?.length > 1 || deviceIdx > 0) && (
                            <button
                              type="button"
                              onClick={() => {
                                const handler = isAdd ? removeDeviceId : removeEditDeviceId;
                                handler(lineIdx, deviceIdx);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remove Line (Add mode only, multiple lines) */}
                {isAdd && lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(lineIdx)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove this product
                  </button>
                )}
              </div>
            ))}

            {/* Add Line (Add mode only) */}
            {isAdd && (
              <button
                type="button"
                onClick={() => setLines([...lines, {
                  dynamic_product_id: '',
                  quantity: 1,
                  unit_price: '',
                  deviceIds: [''],
                  deviceSizes: [''],
                  isQuantityManual: false
                }])}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Product</span>
              </button>
            )}
          </div>

          {/* Payment & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Customer */}
            {isOwner && (
              <CustomerSelector
                storeId={storeId}
                selectedCustomerId={selectedCustomerId}
                onCustomerChange={setSelectedCustomerId}
              />
            )}
          </div>

          {/* Email Receipt Toggle */}
          <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={emailReceipt}
              onChange={(e) => setEmailReceipt(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Email receipt to customer
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-6 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex-1">
            <div className="text-sm text-slate-500 mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPriceProp ? formatPriceProp(totalAmount) : formatPrice(totalAmount)}
            </div>
            {!isOnline && (
              <p className="text-xs text-amber-600 mt-1">
                Will be saved offline
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none px-6 py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="flex-1 sm:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
            >
              {isAdd ? 'Create Sale' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}