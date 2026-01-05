/**
 * useCurrency Hook
 * Manages currency formatting with persistence
 */
import { useState, useEffect, useCallback } from 'react';

const CURRENCIES = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  ZAR: { symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' }
};

export function useCurrency() {
  const [currency, setCurrencyState] = useState('NGN');

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_currency');
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
      }
    }
  }, []);

  // Set currency and persist
  const setCurrency = useCallback((code) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_currency', code);
      }
    }
  }, []);

  // Format price
  const formatPrice = useCallback((amount) => {
    const currencyInfo = CURRENCIES[currency] || CURRENCIES.NGN;
    
    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount || 0);
    } catch {
      return `${currencyInfo.symbol}${(amount || 0).toLocaleString()}`;
    }
  }, [currency]);

  // Format currency without symbol
  const formatNumber = useCallback((amount) => {
    return (amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }, []);

  return {
    currency,
    setCurrency,
    formatPrice,
    formatNumber,
    currencies: CURRENCIES,
    currentCurrency: CURRENCIES[currency]
  };
}

export default useCurrency;