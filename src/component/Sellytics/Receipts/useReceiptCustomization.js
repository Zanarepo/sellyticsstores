/**
 * Receipt Customization Hook - Color palette and styling preferences
 */
import { useState, useEffect } from 'react';

const defaultStyles = {
  headerBgColor: '#1E3A8A',
  headerTextColor: '#FFFFFF',
  accentColor: '#4F46E5',
  bodyBgColor: '#FFFFFF',
  bodyTextColor: '#1F2937',
  borderColor: '#E5E7EB'
};

export default function useReceiptCustomization() {
  const [styles, setStyles] = useState(() => {
    const saved = localStorage.getItem('receipt_customization');
    return saved ? JSON.parse(saved) : defaultStyles;
  });

  useEffect(() => {
    localStorage.setItem('receipt_customization', JSON.stringify(styles));
  }, [styles]);

  const updateStyle = (key, value) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  const resetStyles = () => {
    setStyles(defaultStyles);
  };

  return {
    styles,
    updateStyle,
    resetStyles
  };
}