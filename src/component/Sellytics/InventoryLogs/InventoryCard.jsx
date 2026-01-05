import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, BarChart2, ChevronRight, Box } from 'lucide-react';
import useCurrency from './hooks/useCurrency'; // Adjust path if needed

const InventoryCard = forwardRef(({ 
  item, 
  lowStockThreshold = 5,
  onClick
}, ref) => {
  const { formatPrice } = useCurrency(); // Dynamic currency formatter

  const product = item?.dynamic_product;
  if (!product) return null;

  const isLowStock = item.available_qty <= lowStockThreshold;
  const isOutOfStock = item.available_qty <= 0;
  const isUnique = product.is_unique;

  const imeiCount = isUnique && product.dynamic_product_imeis
    ? product.dynamic_product_imeis.split(',').map(i => i.trim()).filter(Boolean).length
    : 0;

  return (
    <motion.div
      ref={ref} // Attach ref here
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`
        relative p-4 bg-white dark:bg-slate-800 rounded-xl border cursor-pointer
        transition-all duration-200 hover:shadow-lg
        ${isOutOfStock 
          ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' 
          : isLowStock 
            ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
            : 'border-slate-200 dark:border-slate-700'
        }
      `}
    >
      {(isOutOfStock || isLowStock) && (
        <div className={`
          absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-medium
          ${isOutOfStock ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}
        `}>
          {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${isUnique 
            ? 'bg-purple-100 dark:bg-purple-900/30' 
            : 'bg-indigo-100 dark:bg-indigo-900/30'
          }
        `}>
          {isUnique ? (
            <Box className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          ) : (
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2">
                {product.name}
              </h3>
              {product.category && (
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  {product.category}
                </span>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                ${isOutOfStock 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' 
                  : isLowStock 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                }
              `}>
                {item.available_qty}
              </div>
              <span className="text-xs text-slate-500">in stock</span>
            </div>

            {item.quantity_sold > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>{item.quantity_sold} sold</span>
              </div>
            )}

            {isUnique && (
              <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>{imeiCount} tracked</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {formatPrice(product.selling_price ?? 0)}
            </span>
            {product.purchase_price != null && (
              <span className="text-xs text-slate-400">
                Cost: {formatPrice(product.purchase_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default InventoryCard;
