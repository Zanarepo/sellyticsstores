/**
 * SwiftCheckout - Sales Table Component
 */
import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Package, Calendar, TrendingUp, Building2 } from 'lucide-react';
import { Badge } from "../SwiftCheckout/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../SwiftCheckout/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import SalesTableHeader from './SalesTableHeader';
import SalesTableRow from './SalesTableRow';
import SalesMobileCard from './SalesMobileCard';

export default function SalesTable({
  viewMode,
  paginatedSales = [],
  paginatedTotals = [],
  onViewDetails,
  onEdit,
  onDelete,
  isMultiStoreOwner,
  ownedStores = [],
  selectedStoreId,
  setSelectedStoreId,
  canDelete,
  canEdit,
  formatPrice,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayedSales = paginatedSales.filter(s => {
    if (!isMultiStoreOwner) return true;
    const shouldShowAll = !selectedStoreId || selectedStoreId === 'all' || selectedStoreId === 'true';
    if (shouldShowAll) return true;
    const saleStoreId = s.store_id ?? s.sale_store?.id;
    if (!saleStoreId) return false;
    return Number(saleStoreId) === Number(selectedStoreId);
  });

  const handleEdit = (sale) => {
    if (onEdit) onEdit(sale);
  };
  
  const handleDelete = (sale) => {
    if (onDelete) onDelete(sale);
  };
  
  const handleViewDetails = (sale) => {
    if (onViewDetails) onViewDetails(sale);
  };

  if (viewMode === 'daily' || viewMode === 'weekly') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {isMultiStoreOwner && (
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-semibold">Multi-Store Summary</h3>
                <p className="text-indigo-100 text-sm">
                  {ownedStores.length} stores • {viewMode === 'daily' ? 'Daily' : 'Weekly'}
                </p>
              </div>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="w-44 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {ownedStores.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.shop_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <AnimatePresence>
            {paginatedTotals.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{t.period}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(t.total)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <TrendingUp className="w-3 h-3" />
                    {t.count} sale{t.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {isMultiStoreOwner && (
        <div className="p-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span className="font-semibold">Multi-Store View</span>
              <Badge className="bg-white/20 text-white border-0 text-xs">
                {ownedStores.length} stores
              </Badge>
            </div>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-48 bg-white text-slate-900 border-0">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {ownedStores.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.shop_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isMobile ? (
        <div className="p-3 space-y-3">
          <AnimatePresence>
            {displayedSales.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Package className="w-12 h-12 text-slate-300" />
                <p className="text-slate-500">No sales found</p>
              </div>
            ) : (
              displayedSales.map((sale, idx) => (
                <SalesMobileCard
                  key={sale.id || idx}
                  sale={sale}
                  index={idx}
                  isMultiStoreOwner={isMultiStoreOwner}
                  canDelete={canDelete(sale)}
                  canEdit={canEdit(sale)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                  formatPrice={formatPrice}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <SalesTableHeader isMultiStoreOwner={isMultiStoreOwner} isMobile={isMobile} />
            <tbody>
              <AnimatePresence>
                {displayedSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isMultiStoreOwner ? 8 : 7}
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-12 h-12 text-slate-300" />
                        <p className="text-slate-500">No sales found</p>
                        <p className="text-xs text-slate-400">Create your first sale to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedSales.map((sale, idx) => (
                    <SalesTableRow
                      key={sale.id || idx}
                      sale={sale}
                      index={idx}
                      isMultiStoreOwner={isMultiStoreOwner}
                      canDelete={canDelete}
                      canEdit={canEdit}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                      formatPrice={formatPrice}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}