
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Mail, Phone } from 'lucide-react';

export default function SupplierRowEditor({ supplier, onClose, onSave }) {
  const [form, setForm] = useState({
    supplier_name: supplier.supplier_name || '',
    email: supplier.email || '',
    phone: supplier.phone || '',
  });

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(supplier.id, {
      ...supplier,
      ...form,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md h-[90vh] max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit Supplier
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update supplier information
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Current Info Summary */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                    <Building2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Current Name</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {supplier.supplier_name || 'Unnamed Supplier'}
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Building2 className="w-4 h-4" />
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={form.supplier_name}
                    onChange={(e) => updateField('supplier_name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="supplier@example.com"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="+234 801 234 5678"
                  />
                </div>
              </div>
            </div>

            {/* Footer - Always Visible */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}