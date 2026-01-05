/**
 * SwiftCheckout - Sales Form Hook
 * Manages sales form state and operations
 */
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentUser, getCreatorMetadata } from '../utils/identity';
import { 
  sanitizeBarcode, 
  isDuplicateDeviceId, 
  findLineByProductName,
  parseDeviceIds,
  deviceIdsToString
} from '../utils/validation';
import { validateSaleForm, checkInventoryAvailability } from '../utils/validation';
import { fetchProductByBarcode, checkDeviceAlreadySold, createCompleteSale } from '../services/salesServices';
import { productCache, inventoryCache, offlineSalesQueue } from '../db/offlineDb';
import { isOnline } from '../services/syncServices';

// Initial line state/
const createEmptyLine = () => ({
  productId: null,
  productName: '',
  quantity: 1,
  unitPrice: 0,
  deviceIds: [],
  deviceSizes: [],
  isQuantityManual: false
});

export default function useSalesForm(onSaleComplete = null) {
  const [lines, setLines] = useState([createEmptyLine()]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [emailReceipt, setEmailReceipt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { storeId, userId } = getCurrentUser();
  
  // Calculate total amount
  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
  }, [lines]);
  
  // Calculate total items
  const totalItems = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.quantity, 0);
  }, [lines]);
  
  // Handle scanned/typed barcode
  const handleBarcodeScan = useCallback(async (barcode) => {
    const normalizedCode = sanitizeBarcode(barcode);
    if (!normalizedCode) {
      return { success: false, error: 'Invalid barcode' };
    }
    
    // Check if already sold
    const soldCheck = await checkDeviceAlreadySold(normalizedCode, storeId);
    if (soldCheck.alreadySold) {
      return { 
        success: false, 
        error: `Device ${normalizedCode} was already sold`,
        alreadySold: true,
        sale: soldCheck.sale
      };
    }
    
    // Check for duplicate in current form
    if (isDuplicateDeviceId(normalizedCode, lines)) {
      toast.warn(`Device ${normalizedCode} is already in this sale`);
      return { success: false, error: 'Duplicate device ID' };
    }
    
    // Fetch product by barcode
    const result = await fetchProductByBarcode(normalizedCode, storeId);
    
    if (!result.success) {
      return result;
    }
    
    const product = result.product;
    const deviceId = result.deviceId || normalizedCode;
    const deviceSize = result.deviceSize || '';
    
    // Check inventory
    const inventory = await inventoryCache.getByProductId(product.id, storeId);
    const availableQty = inventory?.available_qty ?? 0;
    checkInventoryAvailability(availableQty, 1, product.name);
    
    // Find existing line with same product name
    const existingLineIdx = findLineByProductName(lines, product.name);
    
    setLines(prevLines => {
      const newLines = [...prevLines];
      
      if (existingLineIdx !== -1) {
        // Append to existing line
        const existingLine = newLines[existingLineIdx];
        
        // Check if device ID already in this line
        if (existingLine.deviceIds.some(id => 
          sanitizeBarcode(id) === sanitizeBarcode(deviceId)
        )) {
          toast.warn(`Device ${deviceId} is already in this product line`);
          return prevLines;
        }
        
        newLines[existingLineIdx] = {
          ...existingLine,
          deviceIds: [...existingLine.deviceIds, deviceId],
          deviceSizes: [...existingLine.deviceSizes, deviceSize],
          quantity: existingLine.isQuantityManual 
            ? existingLine.quantity 
            : existingLine.deviceIds.length + 1
        };
      } else {
        // Find first empty line or create new
        const emptyLineIdx = newLines.findIndex(line => !line.productId);
        
        const newLine = {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: Number(product.selling_price) || 0,
          deviceIds: [deviceId],
          deviceSizes: [deviceSize],
          isQuantityManual: false
        };
        
        if (emptyLineIdx !== -1) {
          newLines[emptyLineIdx] = newLine;
        } else {
          newLines.push(newLine);
        }
      }
      
      return newLines;
    });
    
    return { 
      success: true, 
      product,
      deviceId,
      deviceSize,
      message: `Added ${product.name}` 
    };
  }, [lines, storeId]);
  
  // Add empty line
  const addLine = useCallback(() => {
    setLines(prev => [...prev, createEmptyLine()]);
  }, []);
  
  // Remove line
  const removeLine = useCallback((lineIdx) => {
    setLines(prev => {
      if (prev.length <= 1) {
        return [createEmptyLine()];
      }
      return prev.filter((_, idx) => idx !== lineIdx);
    });
  }, []);
  
  // Update line field
  const updateLine = useCallback((lineIdx, field, value) => {
    setLines(prev => {
      const newLines = [...prev];
      const line = { ...newLines[lineIdx] };
      
      if (field === 'quantity') {
        line.quantity = Math.max(1, Number(value) || 1);
        line.isQuantityManual = true;
      } else if (field === 'unitPrice') {
        line.unitPrice = Number(value) || 0;
      } else if (field === 'productId') {
        // Handle product selection from dropdown
        // Would need to fetch product details
        line.productId = value;
      } else {
        line[field] = value;
      }
      
      newLines[lineIdx] = line;
      return newLines;
    });
  }, []);
  
  // Add device ID to line
  const addDeviceId = useCallback((lineIdx, deviceId, deviceSize = '') => {
    const normalizedId = sanitizeBarcode(deviceId);
    if (!normalizedId) return false;
    
    // Check for duplicates
    if (isDuplicateDeviceId(normalizedId, lines)) {
      toast.warn('This device ID is already in the sale');
      return false;
    }
    
    setLines(prev => {
      const newLines = [...prev];
      const line = { ...newLines[lineIdx] };
      
      line.deviceIds = [...line.deviceIds, normalizedId];
      line.deviceSizes = [...line.deviceSizes, deviceSize];
      
      if (!line.isQuantityManual) {
        line.quantity = line.deviceIds.length;
      }
      
      newLines[lineIdx] = line;
      return newLines;
    });
    
    return true;
  }, [lines]);
  
  // Remove device ID from line
  const removeDeviceId = useCallback((lineIdx, deviceIdx) => {
    setLines(prev => {
      const newLines = [...prev];
      const line = { ...newLines[lineIdx] };
      
      line.deviceIds = line.deviceIds.filter((_, idx) => idx !== deviceIdx);
      line.deviceSizes = line.deviceSizes.filter((_, idx) => idx !== deviceIdx);
      
      if (!line.isQuantityManual && line.deviceIds.length > 0) {
        line.quantity = line.deviceIds.length;
      }
      
      newLines[lineIdx] = line;
      return newLines;
    });
  }, []);
  
  // Clear form
  const clearForm = useCallback(() => {
    setLines([createEmptyLine()]);
    setPaymentMethod('Cash');
    setCustomerId(null);
    setCustomerName('');
    setEmailReceipt(false);
  }, []);
  
  // Submit sale
  const submitSale = useCallback(async () => {
    // Validate
    const validation = validateSaleForm(lines.filter(l => l.productId), paymentMethod);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return { success: false, errors: validation.errors };
    }
    
    const validLines = lines.filter(l => l.productId);
    
    setIsSubmitting(true);
    
    try {
      if (isOnline()) {
        // Online sale
        const result = await createCompleteSale(
          validLines,
          paymentMethod,
          customerId,
          storeId,
          emailReceipt
        );
        
        if (result.success) {
          toast.success('Sale completed successfully!');
          clearForm();
          if (onSaleComplete) {
            onSaleComplete(result);
          }
        } else {
          toast.error(result.error || 'Failed to create sale');
        }
        
        return result;
      } else {
        // Offline sale
        const salePayload = {
          lines: validLines,
          paymentMethod,
          customerId,
          customerName,
          totalAmount,
          emailReceipt,
          store_id: storeId,
          ...getCreatorMetadata()
        };
        
        const queueResult = await offlineSalesQueue.queueSale(salePayload);
        
        // Update local inventory
        for (const line of validLines) {
          await inventoryCache.updateLocalQty(line.productId, storeId, line.quantity);
        }
        
        toast.info('Sale saved offline - will sync when online');
        clearForm();
        
        if (onSaleComplete) {
          onSaleComplete({ success: true, offline: true, ...queueResult });
        }
        
        return { success: true, offline: true, ...queueResult };
      }
    } catch (error) {
      console.error('Error submitting sale:', error);
      toast.error('Failed to submit sale');
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [lines, paymentMethod, customerId, customerName, totalAmount, emailReceipt, storeId, clearForm, onSaleComplete]);
  
  return {
    // State
    lines,
    paymentMethod,
    customerId,
    customerName,
    emailReceipt,
    isSubmitting,
    totalAmount,
    totalItems,
    
    // Actions
    handleBarcodeScan,
    addLine,
    removeLine,
    updateLine,
    addDeviceId,
    removeDeviceId,
    setPaymentMethod,
    setCustomerId,
    setCustomerName,
    setEmailReceipt,
    clearForm,
    submitSale,
    setLines
  };
}