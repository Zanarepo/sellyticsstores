/**
 * SwiftCheckout - Sales Table Row Component
 */
import React from 'react';

import 'react-toastify/dist/ReactToastify.css';
import { MoreVertical, Edit2, Trash2, Eye, CreditCard, Building2 } from 'lucide-react';
import { Badge } from "../SwiftCheckout/ui/badge";
import { format } from 'date-fns';
import CustomDropdown, { DropdownItem, DropdownSeparator } from '../SwiftCheckout/CustomDropdown';

const paymentColors = {
  'Cash': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Bank Transfer': 'bg-violet-50 text-violet-700 border-violet-200',
  'Card': 'bg-blue-50 text-blue-700 border-blue-200',
  'Wallet': 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function SalesTableRow({
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
    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
      {isMultiStoreOwner && (
        <td className="px-4 py-3">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
            <Building2 className="w-3 h-3 mr-1" />
            {sale.sale_store?.shop_name || sale.store?.shop_name || 'Store'}
          </Badge>
        </td>
      )}

      <td 
        className="px-4 py-3 cursor-pointer group/product hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
        onClick={(e) => {
          if (e.target.closest(".no-row-click")) return;
          onViewDetails(sale);
        }}
      >
        <div className="font-medium text-slate-900 dark:text-white text-sm truncate group-hover/product:underline group-hover/product:text-indigo-600">
          {sale.product_name}
        </div>
        <div className="text-xs text-slate-500 sm:hidden group-hover/product:text-indigo-500">
          {sale.customer_name}
        </div>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {sale.customer_name}
        </span>
      </td>

      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
          {sale.quantity}
        </span>
      </td>

      <td className="px-4 py-3 text-right">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
          {formatPrice(sale.amount)}
        </span>
      </td>

      <td className="px-4 py-3 hidden md:table-cell">
        <Badge variant="outline" className={`${paymentColors[sale.payment_method] || paymentColors['Cash']} text-xs`}>
          <CreditCard className="w-3 h-3 mr-1" />
          {sale.payment_method}
        </Badge>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(sale.sold_at)}
        </span>
      </td>

      <td className="px-4 py-3">
        <CustomDropdown
          trigger={
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          }
        >
          {sale.deviceIds?.length > 0 && (
            <DropdownItem icon={Eye} onClick={() => onViewDetails(sale)}>
              View IDs ({sale.deviceIds.length})
            </DropdownItem>
          )}

          {canEdit(sale) && (
            <DropdownItem icon={Edit2} onClick={() => onEdit(sale)}>
              Edit Sale
            </DropdownItem>
          )}

          {canDelete(sale) && (
            <>
              <DropdownSeparator />
              <DropdownItem 
                icon={Trash2} 
                variant="danger"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this sale?")) {
                    onDelete(sale);
                  }
                }}
              >
                Delete Sale
              </DropdownItem>
            </>
          )}
        </CustomDropdown>
      </td>
    </tr>
  );
}