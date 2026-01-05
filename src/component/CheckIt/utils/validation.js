/**
 * SwiftCheckout - Validation Utilities
 */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sanitize scanned input
export function sanitizeBarcode(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[\00-\x7F]/g, '')
    .trim()
    .toUpperCase();
}

// Validate device ID format
export function isValidDeviceId(deviceId) {
  if (!deviceId || typeof deviceId !== 'string') return false;
  const sanitized = sanitizeBarcode(deviceId);
  return sanitized.length >= 3 && /^[A-Z0-9\-_]+$/i.test(sanitized);
}

// Check for duplicate device ID in lines
export function isDuplicateDeviceId(deviceId, lines, currentLineIdx = -1, currentDeviceIdx = -1) {
  const normalizedId = sanitizeBarcode(deviceId);
  if (!normalizedId) return false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const deviceIds = line.deviceIds || [];

    for (let devIdx = 0; devIdx < deviceIds.length; devIdx++) {
      const existingId = sanitizeBarcode(deviceIds[devIdx]);
      if (existingId === normalizedId) {
        if (lineIdx === currentLineIdx && devIdx === currentDeviceIdx) {
          continue;
        }
        return true;
      }
    }
  }

  return false;
}

// Find line with matching product name
export function findLineByProductName(lines, productName) {
  if (!productName || !Array.isArray(lines)) return -1;
  const normalizedName = productName.toLowerCase().trim();
  return lines.findIndex(line =>
    line.productName?.toLowerCase().trim() === normalizedName
  );
}

/* ---------- ONE validateSaleLine (the second one was removed) ---------- */
export function validateSaleLine(line) {
  const errors = [];

  if (!line.dynamic_product_id && !line.productId) {
    errors.push('Product is required');
  }

  if (!line.quantity || line.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!line.unit_price && !line.unitPrice) {
    errors.push('Unit price is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate entire sale form
export function validateSaleForm(lines, paymentMethod) {
  const errors = [];

  if (!lines || lines.length === 0) {
    errors.push('At least one product line is required');
  }

  for (let i = 0; i < lines.length; i++) {
    const lineValidation = validateSaleLine(lines[i]);
    if (!lineValidation.isValid) {
      errors.push(`Line ${i + 1}: ${lineValidation.errors.join(', ')}`);
    }
  }

  if (!paymentMethod) {
    errors.push('Payment method is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Check inventory availability
export function checkInventoryAvailability(availableQty, requestedQty, productName) {
  const available = Number(availableQty) || 0;
  const requested = Number(requestedQty) || 1;

  if (available === 0) {
    toast.error(`Out of stock: ${productName || 'Product'} — restock needed`);
    return { canSell: true, warning: 'out_of_stock' };
  }

  if (available <= 6) {
    toast.warn(`Low stock: Only ${available} left for ${productName || 'Product'}`);
    return { canSell: true, warning: 'low_stock' };
  }

  if (available < requested) {
    toast.warn(`Only ${available} available for ${productName || 'Product'}`);
    return { canSell: true, warning: 'insufficient' };
  }

  return { canSell: true, warning: null };
}

// Parse device IDs from string or array
export function parseDeviceIds(deviceIds) {
  if (Array.isArray(deviceIds)) {
    return deviceIds.map(id => sanitizeBarcode(id)).filter(Boolean);
  }
  if (typeof deviceIds === 'string') {
    return deviceIds.split(',').map(id => sanitizeBarcode(id)).filter(Boolean);
  }
  return [];
}

// Convert device IDs array to comma-separated string
export function deviceIdsToString(deviceIds) {
  if (!Array.isArray(deviceIds)) return '';
  return deviceIds.filter(Boolean).join(',');
}