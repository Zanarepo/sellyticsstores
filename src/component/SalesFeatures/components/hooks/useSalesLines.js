/**
 * useSalesLines - Hook for managing sales line items
 * 
 * Handles:
 * - Line item CRUD operations
 * - Device ID grouping by product name
 * - Duplicate detection
 * - Inventory validation
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const createEmptyLine = () => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  productId: null,
  productName: '',
  unitPrice: 0,
  deviceIds: new Set(),
  deviceSizes: [],
  quantity: 1,
  isManualQty: false,
  isUniqueProduct: false, // Track if product requires unique IDs
});

export default function useSalesLines() {
  const [lines, setLines] = useState([createEmptyLine()]);

  /**
   * Find existing line by product name (case-insensitive)
   */
  const findLineByProductName = useCallback((productName) => {
    return lines.findIndex(
      line => line.productName.toLowerCase() === productName.toLowerCase()
    );
  }, [lines]);

  /**
   * Check if device ID exists in any line
   */
  const isDeviceIdDuplicate = useCallback((deviceId, excludeLineId = null) => {
    const normalizedId = deviceId.trim().toLowerCase();
    return lines.some(line => {
      if (excludeLineId && line.id === excludeLineId) return false;
      return Array.from(line.deviceIds).some(
        id => id.toLowerCase() === normalizedId
      );
    });
  }, [lines]);

  /**
   * Add or update a line with scanned product
   * Groups by product name and appends device IDs
   */
  const addScannedProduct = useCallback((product, deviceId, deviceSize = '') => {
    const normalizedDeviceId = deviceId.trim();
    
    // Check for duplicate device ID
    if (isDeviceIdDuplicate(normalizedDeviceId)) {
      toast.warn(`Device ID "${normalizedDeviceId}" already exists in the sale`);
      return { success: false, reason: 'duplicate' };
    }

    setLines(prevLines => {
      const newLines = [...prevLines];
      const isUnique = product.is_unique || false;
      
      // Find existing line with same product name
      const existingIdx = newLines.findIndex(
        line => line.productName.toLowerCase() === product.name.toLowerCase()
      );

      if (existingIdx !== -1) {
        // Append to existing line
        const existingLine = newLines[existingIdx];
        const updatedDeviceIds = new Set(existingLine.deviceIds);
        updatedDeviceIds.add(normalizedDeviceId);

        const updatedSizes = [...existingLine.deviceSizes];
        updatedSizes.push(deviceSize);

        newLines[existingIdx] = {
          ...existingLine,
          deviceIds: updatedDeviceIds,
          deviceSizes: updatedSizes,
          quantity: existingLine.isManualQty 
            ? existingLine.quantity 
            : updatedDeviceIds.size,
        };
      } else {
        // Find first empty line or create new
        const emptyIdx = newLines.findIndex(line => !line.productId);
        
        const newLine = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          productId: product.id,
          productName: product.name,
          unitPrice: Number(product.selling_price) || 0,
          deviceIds: new Set([normalizedDeviceId]),
          deviceSizes: [deviceSize],
          quantity: 1,
          isManualQty: false,
          isUniqueProduct: isUnique,
        };

        if (emptyIdx !== -1) {
          newLines[emptyIdx] = newLine;
        } else {
          newLines.push(newLine);
        }
      }

      return newLines;
    });

    toast.success(`Added ${product.name} (${normalizedDeviceId})`);
    return { success: true };
  }, [isDeviceIdDuplicate]);

  /**
   * Add generic product (without device ID)
   * For bulk/generic items that don't need unique tracking
   */
  const addGenericProduct = useCallback((product, quantity = 1) => {
    setLines(prevLines => {
      const newLines = [...prevLines];
      const isUnique = product.is_unique || false;
      
      // Find existing line with same product name
      const existingIdx = newLines.findIndex(
        line => line.productName.toLowerCase() === product.name.toLowerCase()
      );

      if (existingIdx !== -1) {
        // Increment quantity on existing line
        const existingLine = newLines[existingIdx];
        newLines[existingIdx] = {
          ...existingLine,
          quantity: existingLine.quantity + quantity,
          isManualQty: true,
        };
      } else {
        // Find first empty line or create new
        const emptyIdx = newLines.findIndex(line => !line.productId);
        
        const newLine = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          productId: product.id,
          productName: product.name,
          unitPrice: Number(product.selling_price) || 0,
          deviceIds: new Set(),
          deviceSizes: [],
          quantity: quantity,
          isManualQty: true,
          isUniqueProduct: isUnique,
        };

        if (emptyIdx !== -1) {
          newLines[emptyIdx] = newLine;
        } else {
          newLines.push(newLine);
        }
      }

      return newLines;
    });

    toast.success(`Added ${quantity}x ${product.name}`);
    return { success: true };
  }, []);

  /**
   * Add empty line
   */
  const addLine = useCallback(() => {
    setLines(prev => [...prev, createEmptyLine()]);
  }, []);

  /**
   * Remove line
   */
  const removeLine = useCallback((lineId) => {
    setLines(prev => {
      const newLines = prev.filter(line => line.id !== lineId);
      // Always keep at least one line
      return newLines.length > 0 ? newLines : [createEmptyLine()];
    });
  }, []);

  /**
   * Update line field
   */
  const updateLine = useCallback((lineId, field, value) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;

      const updated = { ...line };

      switch (field) {
        case 'quantity':
          updated.quantity = Math.max(1, Number(value) || 1);
          updated.isManualQty = true;
          break;
        case 'unitPrice':
          updated.unitPrice = Number(value) || 0;
          break;
        case 'productId':
          updated.productId = value;
          break;
        case 'productName':
          updated.productName = value;
          break;
        default:
          updated[field] = value;
      }

      return updated;
    }));
  }, []);

  /**
   * Add device ID to specific line
   */
  const addDeviceIdToLine = useCallback((lineId, deviceId, deviceSize = '') => {
    const normalizedId = deviceId.trim();
    
    if (!normalizedId) return { success: false, reason: 'empty' };
    
    if (isDeviceIdDuplicate(normalizedId)) {
      toast.warn(`Device ID "${normalizedId}" already exists`);
      return { success: false, reason: 'duplicate' };
    }

    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;

      const updatedDeviceIds = new Set(line.deviceIds);
      updatedDeviceIds.add(normalizedId);

      const updatedSizes = [...line.deviceSizes, deviceSize];

      return {
        ...line,
        deviceIds: updatedDeviceIds,
        deviceSizes: updatedSizes,
        quantity: line.isManualQty ? line.quantity : updatedDeviceIds.size,
      };
    }));

    return { success: true };
  }, [isDeviceIdDuplicate]);

  /**
   * Remove device ID from line
   */
  const removeDeviceIdFromLine = useCallback((lineId, deviceId) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;

      const updatedDeviceIds = new Set(line.deviceIds);
      updatedDeviceIds.delete(deviceId);

      const deviceIndex = Array.from(line.deviceIds).indexOf(deviceId);
      const updatedSizes = [...line.deviceSizes];
      if (deviceIndex !== -1) {
        updatedSizes.splice(deviceIndex, 1);
      }

      return {
        ...line,
        deviceIds: updatedDeviceIds,
        deviceSizes: updatedSizes,
        quantity: line.isManualQty 
          ? line.quantity 
          : Math.max(1, updatedDeviceIds.size),
      };
    }));
  }, []);

  /**
   * Set product for a line (manual selection)
   */
  const setLineProduct = useCallback((lineId, product) => {
    setLines(prev => prev.map(line => {
      if (line.id !== lineId) return line;

      return {
        ...line,
        productId: product.id,
        productName: product.name,
        unitPrice: Number(product.selling_price) || 0,
      };
    }));
  }, []);

  /**
   * Clear all lines
   */
  const clearLines = useCallback(() => {
    setLines([createEmptyLine()]);
  }, []);

  /**
   * Get lines formatted for submission
   */
  const getSubmitData = useCallback(() => {
    return lines
      .filter(line => line.productId) // Only lines with products
      .map(line => ({
        dynamic_product_id: line.productId,
        quantity: line.quantity,
        unit_price: line.unitPrice,
        device_ids: Array.from(line.deviceIds),
        device_sizes: line.deviceSizes,
        amount: line.quantity * line.unitPrice,
      }));
  }, [lines]);

  /**
   * Calculate total amount
   */
  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => {
      return sum + (line.quantity * line.unitPrice);
    }, 0);
  }, [lines]);

  /**
   * Check if form is valid for submission
   */
  const isValid = useMemo(() => {
    return lines.some(line => line.productId && line.quantity > 0);
  }, [lines]);

  /**
   * Get line count (non-empty)
   */
  const lineCount = useMemo(() => {
    return lines.filter(line => line.productId).length;
  }, [lines]);

  return {
    lines,
    setLines,
    
    // Line operations
    addLine,
    removeLine,
    updateLine,
    clearLines,
    
    // Product operations
    addScannedProduct,
    addGenericProduct, // NEW: For non-unique products
    setLineProduct,
    findLineByProductName,
    
    // Device ID operations
    addDeviceIdToLine,
    removeDeviceIdFromLine,
    isDeviceIdDuplicate,
    
    // Computed values
    totalAmount,
    isValid,
    lineCount,
    
    // Submit helper
    getSubmitData,
  };
}