// src/components/Sellytics/Debt/DebtForm.jsx
import React, { useState } from 'react';

export default function DebtForm({ customers, onSubmit }) {
  const [form, setForm] = useState({
    customer_id: '',
    amount_owed: ''
  });

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const success = await onSubmit(form);
    if (success) {
      setForm({ customer_id: '', amount_owed: '' });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-gray-900 p-4 rounded"
    >
      <select
        name="customer_id"
        value={form.customer_id}
        onChange={handleChange}
        required
        className="p-2 border rounded dark:bg-gray-900"
      >
        <option value="">Select Customer</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>
            {c.fullname}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="amount_owed"
        value={form.amount_owed}
        onChange={handleChange}
        step="0.01"
        required
        placeholder="Amount Owed"
        className="p-2 border rounded dark:bg-gray-900"
      />

      <button
        type="submit"
        className="sm:col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        Add Debt
      </button>
    </form>
  );
}
