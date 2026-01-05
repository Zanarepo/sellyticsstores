/**
 * SwiftCheckout - Sales Line Item Component
 * Desktop table row and mobile card variants
 */
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  MoreVertical, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Package,
  X,
  Eye,
  Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';
import CustomDropdown, { DropdownItem, DropdownSeparator } from '../SwiftCheckout/CustomDropdown';
import { formatPrice } from '../SwiftCheckout/utils/formatting';

// Desktop Table Row
export function SalesLineRow({
  line,
  index,
  onQuantityChange,
  onRemoveLine,
  onAddDeviceId,
  onRemoveDeviceId,
  onViewProduct,
  disabled = false
}) {
  const lineTotal = line.quantity * line.unitPrice;
  
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.02 }}
      className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
    >
      {/* Product Name */}
      <td className="px-4 py-3">
        <div 
          className="cursor-pointer group/product"
          onClick={() => onViewProduct?.(line)}
        >
          <div className="font-medium text-slate-900 dark:text-white text-sm truncate group-hover/product:text-indigo-600 transition-colors">
            {line.productName || 'Select Product'}
          </div>
          {line.deviceIds.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {line.deviceIds.length} ID{line.deviceIds.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </td>
      
      {/* Quantity */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onQuantityChange(index, Math.max(1, line.quantity - 1))}
            disabled={disabled || line.quantity <= 1}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center font-semibold text-slate-900 dark:text-white">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(index, line.quantity + 1)}
            disabled={disabled}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </td>
      
      {/* Unit Price */}
      <td className="px-4 py-3">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {formatPrice(line.unitPrice)}
        </span>
      </td>
      
      {/* Amount */}
      <td className="px-4 py-3">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
          {formatPrice(lineTotal)}
        </span>
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3">
        <CustomDropdown
          trigger={
            <button 
              type="button"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          }
        >
          <DropdownItem 
            icon={Eye} 
            onClick={() => onViewProduct?.(line)}
          >
            View Product
          </DropdownItem>
          
          <DropdownItem 
            icon={Plus} 
            onClick={() => onAddDeviceId?.(index)}
          >
            Add Device ID
          </DropdownItem>
          
          {line.deviceIds.length > 0 && (
            <DropdownItem 
              icon={Tag} 
              onClick={() => {
                // Show device IDs in toast for now
                toast.info(`Device IDs: ${line.deviceIds.join(', ')}`);
              }}
            >
              View IDs ({line.deviceIds.length})
            </DropdownItem>
          )}
          
          <DropdownSeparator />
          
          <DropdownItem 
            icon={Trash2} 
            variant="danger"
            onClick={() => onRemoveLine(index)}
          >
            Remove Line
          </DropdownItem>
        </CustomDropdown>
      </td>
    </motion.tr>
  );
}

// Mobile Card Variant
export function SalesLineCard({
  line,
  index,
  onQuantityChange,
  onRemoveLine,
  onAddDeviceId,
  onRemoveDeviceId,
  onViewProduct,
  disabled = false
}) {
  const lineTotal = line.quantity * line.unitPrice;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.02 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onViewProduct?.(line)}
        >
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {line.productName || 'Select Product'}
          </h3>
          {line.deviceIds.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {line.deviceIds.length} Device ID{line.deviceIds.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        <CustomDropdown
          trigger={
            <button 
              type="button"
              className="p-2 -mr-2 -mt-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          }
        >
          <DropdownItem 
            icon={Eye} 
            onClick={() => onViewProduct?.(line)}
          >
            View Product
          </DropdownItem>
          
          <DropdownItem 
            icon={Plus} 
            onClick={() => onAddDeviceId?.(index)}
          >
            Add Device ID
          </DropdownItem>
          
          <DropdownSeparator />
          
          <DropdownItem 
            icon={Trash2} 
            variant="danger"
            onClick={() => onRemoveLine(index)}
          >
            Remove Line
          </DropdownItem>
        </CustomDropdown>
      </div>
      
      {/* Device IDs */}
      {line.deviceIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {line.deviceIds.map((deviceId, devIdx) => (
            <span 
              key={devIdx}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs"
            >
              {deviceId}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemoveDeviceId(index, devIdx)}
                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      
      {/* Stats Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Qty:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <button
              type="button"
              onClick={() => onQuantityChange(index, Math.max(1, line.quantity - 1))}
              disabled={disabled || line.quantity <= 1}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-semibold text-slate-900 dark:text-white text-sm">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(index, line.quantity + 1)}
              disabled={disabled}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {/* Price */}
        <div className="text-right">
          <div className="text-xs text-slate-500">
            {formatPrice(line.unitPrice)} each
          </div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatPrice(lineTotal)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Empty state
export function EmptyLinesPlaceholder({ onOpenScanner }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
        No items yet
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Scan a product or enter an ID to get started
      </p>
      <button
        type="button"
        onClick={onOpenScanner}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
      >
        Open Scanner
      </button>
    </div>
  );
}