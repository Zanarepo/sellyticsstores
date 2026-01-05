import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast'
import { hasDuplicateDeviceId } from '../../../utils/deviceValidation';
import { defaultEntry } from './EditDebtModal';

export default function useDebtEntryLogic({
  initialData,
  isEdit,
  storeId,
  customers,
  products,
  addNotification,
  onSuccess,
}) {
  const [debtEntries, setDebtEntries] = useState([defaultEntry]);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isEdit && initialData) {
      const hasImeis = initialData.device_id?.trim() !== '';
      setDebtEntries([{
        ...defaultEntry,
        ...initialData,
        customer_id: initialData.customer_id || '',
        dynamic_product_id: initialData.dynamic_product_id || '',
        deviceIds: initialData.device_id
          ? initialData.device_id.split(',').map(s => s.trim()).filter(Boolean)
          : [''],
        deviceSizes: initialData.device_sizes
          ? initialData.device_sizes.split(',').map(s => s.trim()).filter(Boolean)
          : [''],
        qty: initialData.qty || 1,
        owed: initialData.owed || '',
        deposited: initialData.deposited || 0,
        date: initialData.date
          ? initialData.date.split('T')[0]
          : new Date().toISOString().split('T')[0],
        isUniqueProduct: hasImeis,
      }]);
    } else {
      setDebtEntries([defaultEntry]);
    }
  }, [initialData, isEdit]);

  // Derived calculations
  const calculatedDebts = useMemo(() => {
    return debtEntries.map(entry => {
      const owed = parseFloat(entry.owed) || 0;
      const deposited = parseFloat(entry.deposited) || 0;
      return {
        ...entry,
        remaining_balance: (owed - deposited).toFixed(2),
        deviceIds: Array.isArray(entry.deviceIds) ? entry.deviceIds : [''],
        deviceSizes: Array.isArray(entry.deviceSizes) ? entry.deviceSizes : [''],
      };
    });
  }, [debtEntries]);

  const handleChange = (index, field, value) => {
    setDebtEntries(prev =>
      prev.map((entry, i) => {
        if (i !== index) return entry;
        const newEntry = { ...entry };

        if (field === 'customer_id') {
          newEntry.customer_id = value;
          const cust = customers.find(c => c.id === parseInt(value));
          newEntry.customer_name = cust?.fullname || '';
        }

        else if (field === 'dynamic_product_id') {
          newEntry.dynamic_product_id = value;
          const prod = products.find(p => p.id === parseInt(value));
          if (prod) {
            newEntry.product_name = prod.name;
            const price = parseFloat(prod.selling_price) || 0;
            const isUnique = !!prod.dynamic_product_imeis?.trim();
            newEntry.isUniqueProduct = isUnique;

            if (isUnique) {
              newEntry.deviceIds = Array.isArray(newEntry.deviceIds) ? newEntry.deviceIds : [''];
              newEntry.deviceSizes = Array.isArray(newEntry.deviceSizes) ? newEntry.deviceSizes : [''];
              newEntry.qty = newEntry.deviceIds.filter(Boolean).length || 1;
              newEntry.owed = (price * newEntry.qty).toFixed(2);
            } else {
              newEntry.deviceIds = [''];
              newEntry.deviceSizes = [''];
              newEntry.qty = newEntry.qty || 1;
              newEntry.owed = (newEntry.qty * price).toFixed(2);
            }
          }
        }

        else if (field === 'qty') {
          const qty = parseFloat(value) || 1;
          if (newEntry.isUniqueProduct) {
            addNotification('Quantity for unique products is determined by Device IDs.', 'warning');
            return newEntry;
          }
          newEntry.qty = qty;
          const prod = products.find(p => p.id === parseInt(newEntry.dynamic_product_id));
          if (prod) newEntry.owed = (qty * parseFloat(prod.selling_price || 0)).toFixed(2);
        }

        else if (field === 'deviceId') {
          const { deviceIndex, value: deviceValue } = value;
          newEntry.deviceIds = Array.isArray(newEntry.deviceIds) ? [...newEntry.deviceIds] : [''];
          newEntry.deviceIds[deviceIndex] = deviceValue;
          newEntry.qty = newEntry.deviceIds.filter(Boolean).length || 1;
          const prod = products.find(p => p.id === parseInt(newEntry.dynamic_product_id));
          if (prod) newEntry.owed = (parseFloat(prod.selling_price || 0) * newEntry.qty).toFixed(2);
        }

        else if (field === 'deviceSize') {
          const { deviceIndex, value: sizeValue } = value;
          newEntry.deviceSizes = Array.isArray(newEntry.deviceSizes) ? [...newEntry.deviceSizes] : [''];
          newEntry.deviceSizes[deviceIndex] = sizeValue;
        }

        else {
          newEntry[field] = value;
        }

        return newEntry;
      })
    );
  };

  const addDebtEntry = () => {
    if (!isEdit) setDebtEntries(prev => [...prev, defaultEntry]);
  };

  const removeDebtEntry = index => {
    if (!isEdit && debtEntries.length > 1) setDebtEntries(prev => prev.filter((_, i) => i !== index));
  };

  const addDeviceRow = entryIndex => {
    setDebtEntries(prev => {
      const updated = [...prev];
      const current = { ...updated[entryIndex] };
      current.deviceIds = Array.isArray(current.deviceIds) ? [...current.deviceIds, ''] : [''];
      current.deviceSizes = Array.isArray(current.deviceSizes) ? [...current.deviceSizes, ''] : [''];
      updated[entryIndex] = current;
      return updated;
    });
  };

  const removeDeviceRow = (entryIndex, deviceIndex) => {
    setDebtEntries(prev => {
      const updated = [...prev];
      const current = { ...updated[entryIndex] };
      current.deviceIds = Array.isArray(current.deviceIds) ? current.deviceIds.filter((_, i) => i !== deviceIndex) : [''];
      current.deviceSizes = Array.isArray(current.deviceSizes) ? current.deviceSizes.filter((_, i) => i !== deviceIndex) : [''];
      if (!current.deviceIds.length) {
        current.deviceIds = [''];
        current.deviceSizes = [''];
      }
      const prod = products.find(p => p.id === parseInt(current.dynamic_product_id));
      const price = prod ? parseFloat(prod.selling_price || 0) : 0;
      current.qty = current.deviceIds.filter(Boolean).length || 1;
      current.owed = (price * current.qty).toFixed(2);
      updated[entryIndex] = current;
      return updated;
    });
  };
const handleScanSuccess = (code, entryIndex, deviceIndex) => {
  if (!code || typeof code !== 'string') return false;
  const cleanCode = code.trim();
  if (!cleanCode) return false;

  // Duplicate check
  if (hasDuplicateDeviceId(debtEntries, cleanCode, entryIndex)) {
    toast(`Duplicate Product ID: ${cleanCode} already added`);
    return false;
  }

  setDebtEntries(prev => {
    const updated = [...prev];
    const current = { ...updated[entryIndex] };

    // Ensure arrays exist
    current.deviceIds = Array.isArray(current.deviceIds) ? [...current.deviceIds] : [];
    current.deviceSizes = Array.isArray(current.deviceSizes) ? [...current.deviceSizes] : [];

    // **Automatically append new row instead of overwriting**
    current.deviceIds.push(cleanCode);
    current.deviceSizes.push(''); // empty size for new row

    // Update qty and owed
    const prod = products.find(p => p.id === parseInt(current.dynamic_product_id));
    const price = prod ? parseFloat(prod.selling_price || 0) : 0;
    current.qty = current.deviceIds.filter(Boolean).length;
    current.owed = (price * current.qty).toFixed(2);

    updated[entryIndex] = current;
    return updated;
  });

  toast.success(`Added: ${cleanCode}`);
  return true;
};






  const saveDebts = async () => {
    if (isLoading) return;
    setIsLoading(true);

    let successCount = 0;

    for (const entry of calculatedDebts) {
      if (!entry.customer_id || !entry.dynamic_product_id || !entry.owed || (entry.isUniqueProduct && !entry.deviceIds.some(Boolean))) {
        addNotification('Incomplete entry skipped.', 'error');
        continue;
      }

      const payload = {
        store_id: storeId,
        customer_id: parseInt(entry.customer_id),
        dynamic_product_id: parseInt(entry.dynamic_product_id),
        customer_name: entry.customer_name,
        product_name: entry.product_name,
        supplier: entry.supplier || null,
        device_id: entry.deviceIds.filter(Boolean).join(', '),
        device_sizes: entry.deviceSizes.filter(Boolean).join(', '),
        qty: entry.deviceIds.filter(Boolean).length || entry.qty,
        owed: parseFloat(entry.owed),
        deposited: parseFloat(entry.deposited || 0),
        remaining_balance: parseFloat(entry.remaining_balance),
        date: entry.date,
        is_paid: parseFloat(entry.remaining_balance) <= 0,
      };

      const { error } = isEdit
        ? await supabase.from('debts').update(payload).eq('id', initialData.id)
        : await supabase.from('debts').insert(payload);

      if (!error) successCount++;
    }

    setIsLoading(false);

    if (successCount) {
      addNotification(`${successCount} debt(s) saved!`, 'success');
      onSuccess?.();
    }
  };

  return {
    debtEntries,
    isLoading,
    calculatedDebts,
    handleChange,
    addDebtEntry,
    removeDebtEntry,
    addDeviceRow,
    removeDeviceRow,
    handleScanSuccess,
    saveDebts,
  };
}
