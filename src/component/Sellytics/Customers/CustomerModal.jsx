// src/components/Customers/CustomerModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, Mail, Calendar, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

export default function CustomerModal({ open, onClose, customer, onSave }) {
  const storeId = Number(localStorage.getItem('store_id'));
  const userEmail = localStorage.getItem('user_email');

  const [form, setForm] = useState({
    fullname: '',
    phone_number: '',
    email: '',
    birthday: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setForm({
        fullname: customer.fullname || '',
        phone_number: customer.phone_number || '',
        email: customer.email || '',
        birthday: customer.birthday || '',
        address: customer.address || '',
      });
    } else {
      setForm({
        fullname: '',
        phone_number: '',
        email: '',
        birthday: '',
        address: '',
      });
    }
  }, [customer, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullname.trim() || !form.phone_number.trim()) {
      toast.error('Full name and phone number are required');
      return;
    }

    setLoading(true);

    const payload = {
      store_id: storeId,
      fullname: form.fullname.trim(),
      phone_number: form.phone_number.trim(),
      email: form.email.trim() || null,
      birthday: form.birthday || null,
      address: form.address.trim() || null,
      created_by_email: userEmail
    };

    let error;

    if (customer) {
      ({ error } = await supabase
        .from('customer')
        .update(payload)
        .eq('id', customer.id));
    } else {
      ({ error } = await supabase.from('customer').insert([payload]));
    }

    if (error) {
      toast.error(error.message || 'Failed to save customer');
    } else {
      toast.success(customer ? 'Customer updated successfully' : 'Customer added successfully');
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
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[90vh] max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {customer ? 'Edit Customer' : 'Add New Customer'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {customer ? 'Update customer information' : 'Register a new customer'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Required Fields */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullname"
                    type="text"
                    value={form.fullname}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone_number"
                    type="tel"
                    value={form.phone_number}
                    onChange={handleChange}
                    required
                    placeholder="+234 801 234 5678"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Birthday
                  </label>
                  <input
                    name="birthday"
                    type="date"
                    value={form.birthday}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="123 Main St, Lagos, Nigeria"
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
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {customer ? 'Update Customer' : 'Add Customer'}
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