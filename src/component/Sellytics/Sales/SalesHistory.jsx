/**
 * SwiftCheckout - Sales History Component
 * Displays list of completed sales with filters
 * @version 2.0.0
 */
import React, { useState, useMemo } from 'react';
import { 
  Package, Calendar, CreditCard, User, Eye, Edit2, 
  Trash2, Hash, ChevronLeft, ChevronRight, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import useCurrency  from './hooks/useCurrency';
import CustomDropdown, { DropdownItem, DropdownSeparator } from './CustomDropdown';

export default function SalesHistory({
  sales,
  isOwner,
  isOnline,
  onViewSale,
  onViewProduct,
  onEditSale,
  onDeleteSale,
  search,
  setSearch,
  dateFilter = 'all',
  onDateFilterChange
}) {
  const {formatPrice } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filter sales by search
  const searchFiltered = useMemo(() => {
    if (!search) return sales;
    const lower = search.toLowerCase();
    return sales.filter(s => 
      s.product_name?.toLowerCase().includes(lower) ||
      s.customer_name?.toLowerCase().includes(lower) ||
      s.device_id?.toLowerCase().includes(lower)
    );
  }, [sales, search]);
  
  // Filter sales by date
  const filteredByDate = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    switch (dateFilter) {
      case 'today':
        return searchFiltered.filter(s => new Date(s.sold_at) >= today);
      case 'week':
        return searchFiltered.filter(s => new Date(s.sold_at) >= weekAgo);
      case 'month':
        return searchFiltered.filter(s => new Date(s.sold_at) >= monthAgo);
      default:
        return searchFiltered;
    }
  }, [searchFiltered, dateFilter]);
  
  // Pagination
  const totalPages = Math.ceil(filteredByDate.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredByDate.slice(startIndex, startIndex + itemsPerPage);
  
  // Totals for filtered period
  const filteredTotal = useMemo(() => {
    return filteredByDate.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  }, [filteredByDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'MMM d, h:mm a');
    } catch {
      return dateStr;
    }
  };

  const canEdit = (sale) => isOwner;
  const canDelete = (sale) => isOwner;

  const handleDelete = async (sale) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    
    const success = await onDeleteSale(sale.id);
    if (success) {
      toast.success('Sale deleted');
    } else {
      toast.error('Failed to delete sale');
    }
  };

  const paymentColors = {
    'Cash': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Bank Transfer': 'bg-violet-50 text-violet-700 border-violet-200',
    'Card': 'bg-blue-50 text-blue-700 border-blue-200',
    'Wallet': 'bg-amber-50 text-amber-700 border-amber-200'
  };

  if (sales.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 text-lg">No sales found</p>
        <p className="text-slate-400 text-sm mt-1">Create your first sale to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sales..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        {/* Date Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          {['all', 'today', 'week', 'month'].map(filter => (
            <button
              key={filter}
              onClick={() => {
                onDateFilterChange?.(filter);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                dateFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
          
          {/* Totals Badge */}
          <div className="ml-auto text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {filteredByDate.length} sales • {formatPrice(filteredTotal)}
          </div>
        </div>
      </div>

      {/* Sales List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <AnimatePresence>
          {paginatedSales.map((sale) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Left: Product Info */}
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                  onClick={() => onViewProduct?.(sale)}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                      {sale.product_name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User className="w-3 h-3" />
                      <span>{sale.customer_name || 'Walk-in'}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Details */}
                <div className="hidden sm:flex items-center gap-4">
                  {/* Quantity */}
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      {sale.quantity}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${paymentColors[sale.payment_method] || paymentColors['Cash']}`}>
                    <CreditCard className="w-3 h-3" />
                    {sale.payment_method}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(sale.sold_at)}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(sale.amount)}
                    </div>
                    {sale.deviceIds?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Hash className="w-3 h-3" />
                        {sale.deviceIds.length} ID{sale.deviceIds.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <CustomDropdown>
                    {({ close }) => (
                      <>
                        <DropdownItem
                          icon={Eye}
                          onClick={() => {
                            onViewSale?.(sale);
                            close();
                          }}
                        >
                          View Details
                        </DropdownItem>
                        
                        <DropdownItem
                          icon={Package}
                          onClick={() => {
                            onViewProduct?.(sale);
                            close();
                          }}
                        >
                          Product Stats
                        </DropdownItem>
                        
                        {sale.deviceIds?.length > 0 && (
                          <DropdownItem
                            icon={Hash}
                            onClick={() => {
                              toast.info(`Device IDs: ${sale.deviceIds.join(', ')}`);
                              close();
                            }}
                          >
                            View IDs ({sale.deviceIds.length})
                          </DropdownItem>
                        )}

                        {canEdit(sale) && (
                          <>
                            <DropdownSeparator />
                            <DropdownItem
                              icon={Edit2}
                              onClick={() => {
                                onEditSale?.(sale);
                                close();
                              }}
                            >
                              Edit Sale
                            </DropdownItem>
                          </>
                        )}

                      {canDelete(sale) && (
        <>
          <DropdownSeparator />
          <DropdownItem
            icon={Trash2}
            variant="danger"
            onClick={() => {
              handleDelete(sale);
              close();
            }}
            disabled={!isOnline}  // ← DISABLE DELETE WHEN OFFLINE
            className={!isOnline ? 'opacity-50 cursor-not-allowed' : ''}  // ← Visual gray-out
          >
            {isOnline ? 'Delete Sale' : 'Delete Sale (offline - disabled)'}
          </DropdownItem>
        </>
                        )}
                      </>
                    )}
                  </CustomDropdown>
                </div>
              </div>

              {/* Mobile: Extra Info */}
              <div className="sm:hidden mt-2 flex items-center gap-3 text-xs text-slate-500">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${paymentColors[sale.payment_method] || paymentColors['Cash']}`}>
                  <CreditCard className="w-3 h-3" />
                  {sale.payment_method}
                </div>
                <span>{formatDate(sale.sold_at)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
          <span className="text-sm text-slate-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredByDate.length)} of {filteredByDate.length}
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 text-sm font-medium">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}