/**
 * SwiftCheckout - Formatting Utilities
 */
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, formatDistanceToNow } from 'date-fns';

const CURRENCY_STORAGE_KEY = 'preferred_currency';

export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', symbol: '₦', name: 'Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Pound Sterling' },
];

// Get preferred currency
export function getPreferredCurrency() {
  if (typeof window === 'undefined') return SUPPORTED_CURRENCIES[0];
  const storedCode = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return SUPPORTED_CURRENCIES.find(c => c.code === storedCode) || SUPPORTED_CURRENCIES[0];
}

// Format price with currency symbol
export function formatPrice(value, currency = null) {
  const curr = currency || getPreferredCurrency();
  const num = Number(value) || 0;
  
  if (Math.abs(num) >= 1_000_000) {
    const suffixes = ['', 'K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    const scaled = num / Math.pow(1000, tier);
    return `${curr.symbol}${scaled.toFixed(1)}${suffixes[tier] || ''}`;
  }
  
  return `${curr.symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Format number without currency
export function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format date
export function formatDate(dateStr, formatStr = 'MMM d, yyyy') {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), formatStr);
  } catch {
    return dateStr;
  }
}

// Format date with time
export function formatDateTime(dateStr) {
  return formatDate(dateStr, 'MMM d, h:mm a');
}

// Format relative time
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

// Truncate text
export function truncate(text, maxLength = 30) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Format quantity badge
export function formatQuantity(qty) {
  const num = Number(qty) || 0;
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// Get payment method color classes
export function getPaymentMethodColors(method) {
  const colors = {
    'Cash': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Bank Transfer': 'bg-violet-50 text-violet-700 border-violet-200',
    'Card': 'bg-blue-50 text-blue-700 border-blue-200',
    'Wallet': 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return colors[method] || colors['Cash'];
}

// Get stock status
export function getStockStatus(availableQty) {
  const qty = Number(availableQty) || 0;
  if (qty === 0) {
    return { status: 'out_of_stock', color: 'text-red-600', bgColor: 'bg-red-50', label: 'Out of Stock' };
  }
  if (qty <= 6) {
    return { status: 'low_stock', color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Low Stock' };
  }
  return { status: 'in_stock', color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'In Stock' };
}