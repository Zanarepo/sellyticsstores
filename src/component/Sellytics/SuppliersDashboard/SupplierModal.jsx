// src/components/Suppliers/SupplierModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building2, Package, Phone, Mail, MapPin, Hash, Loader2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

export default function SupplierModal({ open, onClose, item, onSave }) {
  const storeId = Number(localStorage.getItem('store_id'));

  const [form, setForm] = useState({
    supplier_name: '',
    supplier_phone: '',
    supplier_email: '',
    supplier_address: '',
    device_name: '',
    device_id: '',
    qty: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        supplier_name: item.supplier_name || '',
        supplier_phone: item.supplier_phone || '',
        supplier_email: item.supplier_email || '',
        supplier_address: item.supplier_address || '',
        device_name: item.device_name || '',
        device_id: item.device_id || '',
        qty: item.qty?.toString() || '',
      });
    } else {
      setForm({
        supplier_name: '',
        supplier_phone: '',
        supplier_email: '',
        supplier_address: '',
        device_name: '',
        device_id: '',
        qty: '',
      });
    }
  }, [item, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplier_name.trim() || !form.device_name.trim() || !form.qty) {
      toast.error('Supplier name, product name, and quantity are required');
      return;
    }

    setLoading(true);

    const payload = {
      store_id: storeId,
      supplier_name: form.supplier_name.trim(),
      supplier_phone: form.supplier_phone.trim() || null,
      supplier_email: form.supplier_email.trim() || null,
      supplier_address: form.supplier_address.trim() || null,
      device_name: form.device_name.trim(),
      device_id: form.device_id.trim() || null,
      qty: parseInt(form.qty, 10),
    };

    let error;

    if (item) {
      ({ error } = await supabase
        .from('suppliers_inventory')
        .update(payload)
        .eq('id', item.id));
    } else {
      ({ error } = await supabase.from('suppliers_inventory').insert([payload]));
    }

    if (error) {
      toast.error(`Failed to ${item ? 'update' : 'add'} inventory: ${error.message}`);
    } else {
      toast.success(`Inventory entry ${item ? 'updated' : 'added'} successfully`);
      onSave();
      onClose();
    }

    setLoading(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {item ? 'Edit Inventory Entry' : 'Add Supplier Inventory'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item ? 'Update supplier and product details' : 'Record new stock from supplier'}
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
              {/* Supplier Section */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Supplier Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="supplier_name"
                    value={form.supplier_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Tech Distributors Ltd"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number
                    </label>
                    <input
                      name="supplier_phone"
                      type="tel"
                      value={form.supplier_phone}
                      onChange={handleChange}
                      placeholder="+234 801 234 5678"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email Address
                    </label>
                    <input
                      name="supplier_email"
                      type="email"
                      value={form.supplier_email}
                      onChange={handleChange}
                      placeholder="supplier@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Supplier Address
                  </label>
                  <textarea
                    name="supplier_address"
                    value={form.supplier_address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="123 Business Road, Lagos, Nigeria"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Product Section */}
              <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Product Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="device_name"
                      value={form.device_name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., iPhone 15 Pro"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="qty"
                      type="number"
                      min="1"
                      value={form.qty}
                      onChange={handleChange}
                      required
                      placeholder="50"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Hash className="inline w-4 h-4 mr-1" />
                    Serial/IMEI Numbers (optional)
                  </label>
                  <textarea
                    name="device_id"
                    value={form.device_id}
                    onChange={handleChange}
                    rows={4}
                    placeholder="IMEI123456789, IMEI987654321 (comma-separated)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer - Always Visible */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-3 justify-end flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {item ? 'Update Entry' : 'Add Inventory'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}