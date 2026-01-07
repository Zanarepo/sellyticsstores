// src/components/Debts/EditDebtModal/DebtEntry.jsx
import React, { useEffect, useState, useCallback } from 'react';
import DeviceIdSection from './DeviceIdSection';
import { FaTrash } from 'react-icons/fa';
import { Camera, AlertCircle } from 'lucide-react';

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
  onOpenScanner, // (entryIndex, deviceIndex) => void
}) {
  const [errors, setErrors] = useState({});
  const isUnique = entry.isUniqueProduct && entry.dynamic_product_id;



// Validation function (wrapped in useCallback)
const validateField = useCallback((field, value) => {
  const newErrors = { ...errors };

  switch (field) {
    case 'customer_id':
      if (!value || value === '') {
        newErrors.customer_id = 'Customer is required';
      } else {
        delete newErrors.customer_id;
      }
      break;
    case 'dynamic_product_id':
      if (!value || value === '') {
        newErrors.dynamic_product_id = 'Product is required';
      } else {
        delete newErrors.dynamic_product_id;
      }
      break;
    case 'qty':
      if (!value || value < 1) {
        newErrors.qty = 'Quantity must be at least 1';
      } else {
        delete newErrors.qty;
      }
      break;
    case 'owed':
      if (value === undefined || value === null || value < 0) {
        newErrors.owed = 'Owed amount is required';
      } else {
        delete newErrors.owed;
      }
      break;
    case 'date':
      if (!value) {
        newErrors.date = 'Date is required';
      } else {
        delete newErrors.date;
      }
      break;
    default:
      break;
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [errors]); // Depend on errors

// Validate on blur
const handleBlur = (field, value) => {
  validateField(field, value);
};

// Validate all fields (wrapped in useCallback)
const validateAll = useCallback(() => {
  const fieldsToValidate = ['customer_id', 'dynamic_product_id', 'qty', 'owed', 'date'];
  let allValid = true;
  
  fieldsToValidate.forEach(field => {
    const isValid = validateField(field, entry[field]);
    if (!isValid) allValid = false;
  });

  return allValid;
}, [entry, validateField]); // Depend on entry and validateField

// Expose validation to parent (optional)
useEffect(() => {
  if (entry.validate) {
    validateAll();
  }
}, [entry.validate, validateAll]);

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

  // Handle change with validation
  const handleChange = (field, value) => {
    onChange(index, field, value);
    // Validate after change if field was previously in error
    if (errors[field]) {
      setTimeout(() => validateField(field, value), 100);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 sm:p-6 mb-6 bg-gray-50 dark:bg-gray-800 w-full overflow-x-hidden">

      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">
          {isEdit ? 'Debt Details' : `Entry ${index + 1}`}
        </h3>

        {!isEdit && index !== 0 && (
          <button
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="Remove entry"
          >
            <FaTrash className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Customer */}
        <div className="w-full min-w-0">
          <label className="block text-sm font-medium mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            value={entry.customer_id || ''}
            onChange={(e) => handleChange('customer_id', e.target.value)}
            onBlur={(e) => handleBlur('customer_id', e.target.value)}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 ${
              errors.customer_id
                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.fullname}</option>
            ))}
          </select>
          {errors.customer_id && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.customer_id}</span>
            </div>
          )}
        </div>

        {/* Product + Camera */}
        <div className="w-full min-w-0">
          <label className="block text-sm font-medium mb-1">
            Product <span className="text-red-500">*</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex-1 min-w-0">
              <select
                value={entry.dynamic_product_id || ''}
                onChange={(e) => handleChange('dynamic_product_id', e.target.value)}
                onBlur={(e) => handleBlur('dynamic_product_id', e.target.value)}
                className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 ${
                  errors.dynamic_product_id
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                <option value="">Select Product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₦{p.selling_price || 0})
                  </option>
                ))}
              </select>
              {errors.dynamic_product_id && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.dynamic_product_id}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenScanner(index, null)}
              className="
                w-full sm:w-auto
                px-4 py-3
                bg-indigo-600 hover:bg-indigo-700
                text-white rounded-lg
                font-medium
                flex items-center justify-center
                shrink-0
              "
              title="Scan barcode"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={entry.qty}
            disabled={isUnique}
            onChange={(e) => handleChange('qty', parseInt(e.target.value) || 1)}
            onBlur={(e) => handleBlur('qty', parseInt(e.target.value) || 1)}
            className={`w-full p-3 border rounded-lg ${
              isUnique 
                ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed' 
                : errors.qty
                ? 'border-red-500 focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-900'
                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'
            }`}
          />
          {errors.qty && !isUnique && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.qty}</span>
            </div>
          )}
        </div>

        {/* Owed */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Owed <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={entry.owed}
            onChange={(e) => handleChange('owed', parseFloat(e.target.value) || 0)}
            onBlur={(e) => handleBlur('owed', parseFloat(e.target.value) || 0)}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 ${
              errors.owed
                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {errors.owed && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.owed}</span>
            </div>
          )}
        </div>

        {/* Deposited */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">Deposited</label>
          <input
            type="number"
            min="0"
            value={entry.deposited}
            onChange={(e) => handleChange('deposited', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
          />
        </div>

        {/* Date */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={entry.date}
            onChange={(e) => handleChange('date', e.target.value)}
            onBlur={(e) => handleBlur('date', e.target.value)}
            className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-900 ${
              errors.date
                ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {errors.date && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.date}</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Error Message */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Please fix the following errors:
            </p>
            <ul className="text-xs text-red-600 dark:text-red-300 mt-1 list-disc list-inside">
              {Object.values(errors).map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Unique Product Device IDs */}
      {isUnique && (
        <div className="mt-6">
          <DeviceIdSection
            entry={entry}
            index={index}
            onChange={onChange}
            onRemoveDevice={onRemoveDevice}
            onAddDeviceRow={() => onAddDeviceRow(index)}
            onOpenScanner={(deviceIndex) => onOpenScanner(index, deviceIndex)}
          />
        </div>
      )}

      {/* Non-Unique Info */}
      {!isUnique && entry.dynamic_product_id && (
        <p className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold rounded-lg text-center text-sm">
          ✅ Non-Unique Product – Total Owed is Price × Quantity
        </p>
      )}
    </div>
  );
}