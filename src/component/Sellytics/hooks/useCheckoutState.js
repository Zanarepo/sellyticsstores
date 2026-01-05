/**
 * SwiftCheckout - Checkout State Hook
 * Manages checkout form state with device tracking
 * @version 2.0.0
 */
import { useState, useCallback, useMemo } from 'react';

// Helper to create empty device row
const createEmptyDeviceRow = () => ({
  key: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  deviceId: '',
  deviceSize: '',
  isScanned: false
});

// Helper to create empty line
const createEmptyLine = () => ({
  id: Date.now() + Math.random(),
  dynamic_product_id: null,
  productName: '',
  quantity: 1,
  unit_price: 0,
  isUnique: false,
  deviceRows: [createEmptyDeviceRow()],
  isQuantityManual: false
});

export default function useCheckoutState() {
  // Lines state
  const [lines, setLines] = useState([createEmptyLine()]);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [emailReceipt, setEmailReceipt] = useState(false);
  
  // Scanner target
  const [scannerTargetLineId, setScannerTargetLineId] = useState(null);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => {
      if (!line.dynamic_product_id) return sum;
      return sum + (line.quantity * line.unit_price);
    }, 0);
  }, [lines]);

  // Add new empty line
  const addLine = useCallback(() => {
    setLines(prev => [...prev, createEmptyLine()]);
  }, []);

  // Remove line
  const removeLine = useCallback((lineId) => {
    setLines(prev => {
      const filtered = prev.filter(l => l.id !== lineId);
      return filtered.length > 0 ? filtered : [createEmptyLine()];
    });
  }, []);

  // Update line
  const updateLine = useCallback((lineId, updatesOrFn) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      
      if (typeof updatesOrFn === 'function') {
        const result = updatesOrFn(line);
        if (result === null) return null;
        return result;
      }
      
      return { ...line, ...updatesOrFn };
    }).filter(Boolean));
  }, []);

  // Set product for a line
  const setLineProduct = useCallback((lineId, product) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      
      return {
        ...line,
        dynamic_product_id: product.id,
        productName: product.name,
        unit_price: Number(product.selling_price) || 0,
        isUnique: product.is_unique || false,
        isQuantityManual: !(product.is_unique || false)
      };
    }));
  }, []);

  // Add device row to a line
  const addDeviceRow = useCallback((lineId) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      
      return {
        ...line,
        deviceRows: [...(line.deviceRows || []), createEmptyDeviceRow()]
      };
    }));
  }, []);

  // Update device row
  const updateDeviceRow = useCallback((lineId, rowKey, updates) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      
      const newDeviceRows = (line.deviceRows || []).map(row => {
        if (row.key !== rowKey) return row;
        return { ...row, ...updates };
      });
      
      const populatedCount = newDeviceRows.filter(r => r.deviceId).length;
      const newQuantity = line.isUnique 
        ? Math.max(1, populatedCount)
        : line.quantity;
      
      return {
        ...line,
        deviceRows: newDeviceRows,
        quantity: newQuantity
      };
    }));
  }, []);

  // Remove device row
  const removeDeviceRow = useCallback((lineId, rowKey) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;
      
      let newDeviceRows = (line.deviceRows || []).filter(row => row.key !== rowKey);
      
      if (line.isUnique && newDeviceRows.length === 0) {
        newDeviceRows = [createEmptyDeviceRow()];
      }
      
      if (newDeviceRows.length === 0 && !line.dynamic_product_id) {
        return null;
      }
      
      if (newDeviceRows.length === 0) {
        newDeviceRows = [createEmptyDeviceRow()];
      }
      
      const populatedCount = newDeviceRows.filter(r => r.deviceId).length;
      const newQuantity = line.isUnique 
        ? Math.max(1, populatedCount)
        : line.quantity;
      
      return {
        ...line,
        deviceRows: newDeviceRows,
        quantity: newQuantity
      };
    }).filter(Boolean));
  }, []);

  // Apply scanned barcode to state
  const applyBarcode = useCallback((product, barcode, deviceSize = '', targetLineId = null, targetRowKey = null) => {
    const normalized = barcode.trim();

    setLines(prev => {
      const hasDuplicate = prev.some(line => {
        if (targetLineId !== null && line.id === targetLineId) {
          return (line.deviceRows || []).some(r => {
            if (targetRowKey !== null && r.key === targetRowKey) return false;
            return r.deviceId && r.deviceId.toLowerCase() === normalized.toLowerCase();
          });
        }
        return (line.deviceRows || []).some(r => 
          r.deviceId && r.deviceId.toLowerCase() === normalized.toLowerCase()
        );
      });

      if (hasDuplicate) {
        return prev;
      }

      const newLines = [...prev];

      const createLineForProduct = () => ({
        id: Date.now() + Math.random(),
        dynamic_product_id: product.id,
        productName: product.name,
        quantity: 1,
        unit_price: Number(product.selling_price) || 0,
        isUnique: product.is_unique || false,
        deviceRows: [createEmptyDeviceRow()],
        isQuantityManual: !(product.is_unique || false)
      });

      let lineIdx = targetLineId !== null
        ? newLines.findIndex(l => l.id === targetLineId)
        : -1;

      let originalLineIdx = lineIdx;
      let shouldClearOriginal = false;

      if (lineIdx !== -1) {
        const targetLine = newLines[lineIdx];
        if (targetLine.dynamic_product_id && targetLine.dynamic_product_id !== product.id) {
          shouldClearOriginal = true;
          lineIdx = -1;
        }
      }

      if (lineIdx === -1) {
        lineIdx = newLines.findIndex(l => l.dynamic_product_id === product.id);
      }

      if (lineIdx === -1) {
        lineIdx = newLines.findIndex(l => !l.dynamic_product_id);
      }

      if (lineIdx === -1) {
        newLines.push(createLineForProduct());
        lineIdx = newLines.length - 1;
      }

      const line = { ...newLines[lineIdx] };

      if (!line.dynamic_product_id) {
        line.dynamic_product_id = product.id;
        line.productName = product.name;
        line.unit_price = Number(product.selling_price) || 0;
        line.isUnique = product.is_unique || false;
        line.deviceRows = line.deviceRows?.length ? line.deviceRows : [createEmptyDeviceRow()];
        line.isQuantityManual = !(product.is_unique || false);
      }

      const deviceRows = [...(line.deviceRows || [createEmptyDeviceRow()])];
      
      let slotIdx = -1;
      if (targetRowKey && !shouldClearOriginal) {
        slotIdx = deviceRows.findIndex(r => r.key === targetRowKey);
      }
      if (slotIdx === -1) {
        slotIdx = deviceRows.findIndex(r => !r.deviceId);
      }
      if (slotIdx === -1) {
        slotIdx = deviceRows.length;
      }

      const baseRow = deviceRows[slotIdx] || createEmptyDeviceRow();
      deviceRows[slotIdx] = {
        ...baseRow,
        deviceId: normalized,
        deviceSize: deviceSize || baseRow.deviceSize || '',
        isScanned: true
      };

      const trackedCount = deviceRows.filter(r => r.deviceId).length;
      let quantity = line.quantity || 1;
      if (line.isUnique) {
        quantity = Math.max(1, trackedCount);
      } else if (!line.isQuantityManual) {
        quantity = quantity + 1;
      }

      newLines[lineIdx] = {
        ...line,
        deviceRows,
        quantity
      };

      if (shouldClearOriginal && originalLineIdx !== -1 && originalLineIdx !== lineIdx && targetRowKey) {
        const originalLine = newLines[originalLineIdx];
        if (originalLine) {
          const clearedDeviceRows = (originalLine.deviceRows || []).map(row => {
            if (row.key === targetRowKey) {
              return { ...row, deviceId: '' };
            }
            return row;
          });
          newLines[originalLineIdx] = {
            ...originalLine,
            deviceRows: clearedDeviceRows
          };
        }
      }

      return newLines;
    });
  }, []);

  // Check for duplicate device ID
  const hasDuplicateDevice = useCallback((deviceId, excludeLineId = null, excludeRowKey = null) => {
    const normalized = deviceId.trim().toLowerCase();
    
    return lines.some(line => {
      if (excludeLineId !== null && line.id === excludeLineId) {
        return (line.deviceRows || []).some(r => {
          if (excludeRowKey !== null && r.key === excludeRowKey) return false;
          return r.deviceId && r.deviceId.toLowerCase() === normalized;
        });
      }
      return (line.deviceRows || []).some(r => 
        r.deviceId && r.deviceId.toLowerCase() === normalized
      );
    });
  }, [lines]);

  // Open scanner for a line
  const openScanner = useCallback((lineId) => {
    setScannerTargetLineId(lineId);
  }, []);

  // Custom customer change that updates both ID and name
  const handleCustomerChange = useCallback((customerId, customerName = '') => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setLines([createEmptyLine()]);
    setPaymentMethod('Cash');
    setSelectedCustomerId(null);
    setSelectedCustomerName('');
    setEmailReceipt(false);
    setScannerTargetLineId(null);
  }, []);

  // Load from existing sale (for editing)
  const loadFromSale = useCallback((sale) => {
    const saleLines = sale.lines || [];
    
    const loadedLines = saleLines.map((l, i) => {
      const deviceIds = (l.deviceIds || l.device_id || '').split(',').filter(Boolean);
      const deviceSizes = (l.deviceSizes || l.device_size || '').split(',').filter(Boolean);
      
      const deviceRows = deviceIds.length > 0
        ? deviceIds.map((id, index) => ({
            key: `${Date.now()}-${i}-${index}`,
            deviceId: id.trim(),
            deviceSize: deviceSizes[index]?.trim() || '',
            isScanned: true
          }))
        : [createEmptyDeviceRow()];
      
      return {
        id: Date.now() + i,
        dynamic_product_id: l.dynamic_product_id,
        productName: l.productName || l.product_name || '',
        quantity: l.quantity || 1,
        unit_price: l.unit_price || 0,
        deviceRows,
        isUnique: l.isUnique || false,
        isQuantityManual: l.isQuantityManual || false
      };
    });
    
    setLines(loadedLines.length > 0 ? loadedLines : [createEmptyLine()]);
    setPaymentMethod(sale.payment_method || 'Cash');
    setSelectedCustomerId(sale.customer_id || null);
    setSelectedCustomerName(sale.customer_name || '');
    setEmailReceipt(sale.email_receipt || false);
  }, []);

  return {
    // State
    lines,
    paymentMethod,
    selectedCustomerId,
    selectedCustomerName,
    emailReceipt,
    totalAmount,
    scannerTargetLineId,
    
    // Setters
    setLines,
    setPaymentMethod,
    setSelectedCustomerId,
    setSelectedCustomerName,
    setEmailReceipt,
    
    // Line actions
    addLine,
    removeLine,
    updateLine,
    setLineProduct,
    
    // Device row actions
    addDeviceRow,
    updateDeviceRow,
    removeDeviceRow,
    
    // Barcode handling
    applyBarcode,
    hasDuplicateDevice,
    
    // Scanner
    openScanner,
    
    // Form actions
    resetForm,
    loadFromSale,
    handleCustomerChange
  };
}