import { useState, useEffect } from 'react';

const STORAGE_KEY = 'receipt_customization';

const DEFAULT_STYLES = {
  headerBgColor: '#1E3A8A',
  headerTextColor: '#FFFFFF',
  accentColor: '#4F46E5',
  borderColor: '#E5E7EB',
  fontFamily: 'monospace',
  logoUrl: ''
};

export default function useReceiptCustomization() {
  const [styles, setStyles] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_STYLES, ...JSON.parse(saved) } : DEFAULT_STYLES;
    } catch {
      return DEFAULT_STYLES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
    } catch (err) {
      console.error('Failed to save receipt customization:', err);
    }
  }, [styles]);

  const updateStyle = (key, value) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  const resetStyles = () => {
    setStyles(DEFAULT_STYLES);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    styles,
    updateStyle,
    resetStyles
  };
}