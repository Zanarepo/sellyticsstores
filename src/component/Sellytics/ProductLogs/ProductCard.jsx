/**
 * ProductCard Component - FIXED UNIQUE ITEM QTY DISPLAY
 * Now correctly shows quantity for unique items even if deviceList is missing
 */
import React, { useState, forwardRef, useMemo } from 'react';
import {
  Package,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  WifiOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../context/currencyContext';

const ProductCard = forwardRef(function ProductCard(
  {
    product,
    index,
    onView,
    onEdit,
    onDelete,
    isOffline,
    isPending,
    permissions,
 
  },
  ref
) {
  const [showMenu, setShowMenu] = useState(false);
  const { preferredCurrency } = useCurrency();



 const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: preferredCurrency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(price);
    } catch (err) {
      // Fallback
      return `${preferredCurrency.symbol} ${price}`;
    }
  };









  const {
    canView = false,
    canEdit = false,
    canDelete = false,
  } = permissions || {};

  const hasAnyAction = canView || canEdit || canDelete;

  // FIXED: Robust quantity calculation for unique items
  const qty = useMemo(() => {
    if (!product.is_unique) {
      return product.purchase_qty || 0;
    }

    // Priority 1: Use pre-formatted deviceList (best case)
    if (product.deviceList && Array.isArray(product.deviceList)) {
      return product.deviceList.length;
    }

    // Priority 2: Fallback to parsing dynamic_product_imeis string
    if (product.dynamic_product_imeis) {
      const imeis = product.dynamic_product_imeis
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      return imeis.length;
    }

    // Final fallback
    return 0;
  }, [product]);

  const handleAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);
    action?.();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      onDelete?.();
    }
  };

  const canDeleteSafely = canDelete && !isOffline;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      onClick={canView ? onView : undefined}
      className={`
        relative p-4 w-full
        bg-white dark:bg-slate-800
        rounded-xl border border-slate-200 dark:border-slate-700
        transition-all
        ${canView ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-80'}
      `}
    >
      {/* Pending badge */}
      {isPending && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30">
          <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2">
                {product.name}
              </h3>

              {product.selling_price != null && (
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Price:
                  </span>{' '}
                  {formatPrice
                    ? formatPrice(product.selling_price)
                    : `$${Number(product.selling_price).toFixed(2)}`}
                </span>
              )}

              {product.suppliers_name && (
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Supplier:
                  </span>{' '}
                  {product.suppliers_name}
                </span>
              )}

              {/* Badges */}
              {product.is_unique && (
                <div className="flex gap-1.5 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 text-[10px] font-bold uppercase">
                    UNIQUE-ITEM
                  </span>
               
                </div>
              )}
            </div>

            {/* CRUD Menu */}
            {hasAnyAction && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
                    >
                      {canView && (
                        <button
                          onClick={(e) => handleAction(onView, e)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      )}

                      {canEdit && (
                        <button
                          onClick={(e) => handleAction(onEdit, e)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={canDeleteSafely ? handleDeleteClick : undefined}
                          disabled={!canDeleteSafely}
                          className={`
                            w-full flex items-center gap-2 px-3 py-2.5 text-sm
                            ${canDeleteSafely
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-slate-400 cursor-not-allowed'}
                          `}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                          {isOffline && (
                            <span className="ml-auto text-[10px] uppercase">Offline</span>
                          )}
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quantity - Now prominently shown */}
          <div className="flex items-center gap-4 mt-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-lg font-bold">
              {qty}
            </div>
            
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            {product.created_at && (
              <span>
                Created: {new Date(product.created_at).toLocaleDateString()}
              </span>
            )}
            {product.updated_by_email && (
              <span className="truncate max-w-[50%]">
                Updated by:{' '}
                <span className="text-indigo-600 dark:text-slate-400">
                  {product.updated_by_email.split('@')[0]}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Offline indicator */}
      {isOffline && isPending && (
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <WifiOff className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.div>
  );
});

export default ProductCard;