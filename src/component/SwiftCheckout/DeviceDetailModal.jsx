/**
 * SwiftCheckout - Device Detail Modal
 */
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X, Package, Tag, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeviceDetailModal({ isOpen, onClose, devices, search }) {
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filteredDevices = devices.filter(d =>
    d.id.toLowerCase().includes(filterText.toLowerCase()) ||
    d.size?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Device IDs
                </h2>
                <p className="text-sm text-slate-500">
                  {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search device IDs..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Device List */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-220px)]">
            {filteredDevices.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No devices found</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredDevices.map((device, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-slate-900 dark:text-white">
                          {device.id}
                        </p>
                        {device.size && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Size: {device.size}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(device.id);
                        toast.success('Copied to clipboard');
                      }}
                      className="px-3 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}