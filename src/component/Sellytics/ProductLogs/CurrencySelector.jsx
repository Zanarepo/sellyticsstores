// CurrencySelector.js - FIXED VERSION
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../context/currencyContext';// Make sure path is correct

export default function CurrencySelector() {
  const [open, setOpen] = useState(false);
  
  // Get currency from context - IMPORTANT: use preferredCurrency, not currency
  const { preferredCurrency, setCurrency, SUPPORTED_CURRENCIES } = useCurrency();
  
  // Use preferredCurrency directly from context
  const current = preferredCurrency; // This is {code, symbol, name}
  
  console.log('CurrencySelector - current currency:', current); // Debug

  const handleChange = (code) => {
    console.log('Changing currency to:', code); // Debug
    setCurrency(code); // This updates the context
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Main Button - Shows current currency from context */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium text-sm sm:text-base shadow-sm"
      >
        <span className="text-xl">{current?.symbol || '$'}</span>
        <div className="flex flex-col items-start leading-tight">
          <span className="font-semibold">{current?.code || 'USD'}</span>
          <span className="text-xs text-slate-500 hidden sm:block">
            {current?.name || 'US Dollar'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute top-full mt-2 right-0 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
            style={{ maxHeight: '70vh' }}
          >
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Select Currency
              </p>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
              {SUPPORTED_CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleChange(curr.code)}
                  className={`w-full px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-between group ${
                    current?.code === curr.code ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{curr.symbol}</span>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{curr.name}</div>
                      <div className="text-xs text-slate-500">{curr.code}</div>
                    </div>
                  </div>
                  {current?.code === curr.code && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}