// src/components/Debts/EditDebtModal/DebtEntry.jsx
import React, { useEffect } from 'react';
import DeviceIdSection from './DeviceIdSection';
import { FaTrash } from 'react-icons/fa';

export default function DebtEntry({
  entry,
  index,
  customers,
  products,
  isEdit,
  onChange,
  onRemove,
  onAddDeviceRow,
  onRemoveDevice,
  onOpenScanner,
}) {
  const isUnique = entry.isUniqueProduct && entry.dynamic_product_id;

  // Update owed automatically for unique products
  useEffect(() => {
    if (isUnique) {
      const product = products.find(p => p.id === entry.dynamic_product_id);
      if (product) {
        const totalOwed = (product.selling_price || 0) * (entry.deviceIds?.length || 0);
        if (entry.owed !== totalOwed) {
          onChange(index, 'owed', totalOwed);
        }
      }
    } else {
      const product = products.find(p => p.id === entry.dynamic_product_id);
      if (product) {
        const totalOwed = (product.selling_price || 0) * (entry.qty || 1);
        if (entry.owed !== totalOwed) {
          onChange(index, 'owed', totalOwed);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.deviceIds?.length, entry.qty, entry.dynamic_product_id, products]);

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6 bg-gray-50 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300">
          {isEdit ? 'Debt Details' : `Entry ${index + 1}`}
        </h3>
        {!isEdit && index !== 0 && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select
            value={entry.customer_id || ''}
            onChange={(e) => onChange(index, 'customer_id', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.fullname}</option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            value={entry.dynamic_product_id || ''}
            onChange={(e) => onChange(index, 'dynamic_product_id', e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (Price: {p.selling_price || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            value={entry.qty}
            disabled={isUnique}
            onChange={(e) => onChange(index, 'qty', parseInt(e.target.value) || 1)}
            className={`w-full p-3 border rounded-lg ${isUnique ? 'bg-gray-200 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Owed */}
        <div>
          <label className="block text-sm font-medium mb-1">Owed</label>
          <input
            type="number"
            min="0"
            value={entry.owed}
            onChange={(e) => onChange(index, 'owed', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Deposited */}
        <div>
          <label className="block text-sm font-medium mb-1">Deposited</label>
          <input
            type="number"
            min="0"
            value={entry.deposited}
            onChange={(e) => onChange(index, 'deposited', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={entry.date}
            onChange={(e) => onChange(index, 'date', e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>
      </div>

      {/* Unique Product Device IDs */}
     
{isUnique && (
  <DeviceIdSection
    entry={entry}
    index={index}
    onChange={onChange}
    onRemoveDevice={onRemoveDevice}
    onAddDeviceRow={() => onAddDeviceRow(index)}
    onOpenScanner={(deviceIndex) => {
      console.log('Opening scanner for entry', index, 'device', deviceIndex);
      onOpenScanner(index, deviceIndex);  // This must be called to trigger the scanner
    }}
  />
)}

      {!isUnique && entry.dynamic_product_id && (
        <p className="mt-4 p-3 bg-green-100 text-green-700 font-semibold rounded-lg text-center">
          ✅ Non-Unique Product – Total Owed is Price × Quantity
        </p>
      )}
    </div>
  );
}
