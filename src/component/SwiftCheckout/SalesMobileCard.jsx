/**
 * SwiftCheckout - Sales Mobile Card Component
 */
import React from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { MoreVertical, Edit2, Trash2, Eye, CreditCard, Building2, Calendar, User } from 'lucide-react';
import { Badge } from "../SwiftCheckout/ui/badge";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import CustomDropdown, { DropdownItem, DropdownSeparator } from '../SwiftCheckout/CustomDropdown';

const paymentColors = {
  'Cash': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Bank Transfer': 'bg-violet-50 text-violet-700 border-violet-200',
  'Card': 'bg-blue-50 text-blue-700 border-blue-200',
  'Wallet': 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function SalesMobileCard({
  sale,
  index,
  isMultiStoreOwner,
  canDelete,
  canEdit,
  onEdit,
  onDelete,
  onViewDetails,
  formatPrice,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-slate-900 dark:text-white truncate cursor-pointer"
            onClick={() => onViewDetails(sale)}
          >
            {sale.product_name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <User className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{sale.customer_name}</span>
          </div>
        </div>

        <CustomDropdown
          trigger={
            <button className="h-8 w-8 -mr-2 -mt-1 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          }
        >
          {sale.deviceIds?.length > 0 && (
            <>
              <DropdownItem icon={Eye} onClick={() => onViewDetails(sale)}>
                View IDs ({sale.deviceIds.length})
              </DropdownItem>
              <DropdownSeparator />
            </>
          )}

          {canEdit && (
            <DropdownItem icon={Edit2} onClick={() => onEdit(sale)}>
              Edit Sale
            </DropdownItem>
          )}

          {canDelete && (
            <>
              <DropdownSeparator />
              <DropdownItem 
                icon={Trash2} 
                variant="danger"
                onClick={() => {
                  if (window.confirm("Delete this sale?")) {
                    onDelete(sale);
                  }
                }}
              >
                Delete Sale
              </DropdownItem>
            </>
          )}
        </CustomDropdown>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-0.5">Qty</div>
            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
              {sale.quantity}
            </div>
          </div>

          <Badge variant="outline" className={`${paymentColors[sale.payment_method] || paymentColors['Cash']} text-xs`}>
            <CreditCard className="w-3 h-3 mr-1" />
            {sale.payment_method}
          </Badge>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500 mb-0.5">Amount</div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatPrice(sale.amount)}
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
        {isMultiStoreOwner && (
          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs">
            <Building2 className="w-3 h-3 mr-1" />
            {sale.sale_store?.shop_name || sale.store?.shop_name || 'Store'}
          </Badge>
        )}

        <div className="flex items-center gap-1 text-xs text-slate-400 ml-auto">
          <Calendar className="w-3 h-3" />
          {formatDate(sale.sold_at)}
        </div>
      </div>

      {/* Offline Indicator */}
      {sale.isOffline && (
        <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs text-amber-700">Pending sync</span>
        </div>
      )}
    </motion.div>
  );
}