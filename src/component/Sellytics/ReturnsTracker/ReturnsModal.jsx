// src/components/returns-management/ReturnsModal.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function ReturnsModal({ editing, setEditing, form, handleChange, saveReturn, queriedReceipts }) {
  if (!editing) return null;

  return (
    <motion.div
      initial={ { opacity: 0 } }
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-3xl space-y-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-center">{editing.id ? 'Edit Return' : 'Add Return'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">Receipt</label>
            <select
              name="receipt_id"
              value={form.receipt_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl dark:bg-slate-800"
              required
            >
              <option value="">Select Receipt</option>
              {queriedReceipts.map(r => (
                <option key={r.receipt_id} value={r.receipt_id}>
                  {r.receipt_code} - {r.product_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Returned Date</label>
            <input
              type="date"
              name="returned_date"
              value={form.returned_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-xl dark:bg-slate-800"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">Customer Address</label>
            <input
              value={form.customer_address || 'N/A'}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Product</label>
            <input
              value={form.product_name}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-semibold">Device ID</label>
            <input
              value={form.device_id || 'N/A'}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Quantity</label>
            <input
              value={form.qty}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Amount</label>
          <input
            value={form.amount}
            readOnly
            className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 rounded-xl"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Remark</label>
          <textarea
            name="remark"
            value={form.remark}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl dark:bg-slate-800"
            rows="3"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-xl dark:bg-slate-800"
          >
            <option value="">Select Status</option>
            <option>Pending</option>
            <option>Processed</option>
            <option>Rejected</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setEditing(null)}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={saveReturn}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}