/**
 * Multi-select Product Selector with Checkboxes
 */
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductSelector({ 
  products, 
  selectedProducts, 
  onAddProduct
 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter products
  const filtered = products.filter(p => {
    const query = search.toLowerCase();
    return p.name?.toLowerCase().includes(query) || 
           p.device_id?.toLowerCase().includes(query);
  });

  // Get selected IDs
  const selectedIds = selectedProducts.map(p => p.id);
  const allFilteredSelected = filtered.length > 0 && 
    filtered.every(p => selectedIds.includes(p.id));

  // Toggle product selection
  const toggleProduct = (product) => {
    if (!selectedIds.includes(product.id)) {
      onAddProduct(product.id);
    }
  };

  // Select all filtered
  const handleSelectAllFiltered = () => {
    filtered.forEach(p => {
      if (!selectedIds.includes(p.id)) {
        onAddProduct(p.id);
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">
            {selectedProducts.length > 0 
              ? `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected`
              : 'Select products to audit'
            }
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Select All */}
            {filtered.length > 0 && (
              <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSelectAllFiltered}
                  disabled={allFilteredSelected}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    allFilteredSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {allFilteredSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="font-medium text-sm text-indigo-600 dark:text-indigo-400">
                    Select All ({filtered.length})
                  </span>
                </button>
              </div>
            )}

            {/* Product List */}
            <div className="max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  {search ? 'No products found' : 'No products available'}
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filtered.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    const qty = product.is_unique 
                      ? (product.deviceList?.length || 0)
                      : (product.purchase_qty || 0);

                    return (
                      <button
                        key={product.id}
                        onClick={() => toggleProduct(product)}
                        disabled={isSelected}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>Stock: {qty}</span>
                            {product.device_id && (
                              <>
                                <span>•</span>
                                <span className="truncate">{product.device_id}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}