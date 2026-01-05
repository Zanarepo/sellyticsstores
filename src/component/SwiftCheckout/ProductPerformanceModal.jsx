/**
 * SwiftCheckout - Product Performance Modal
 * Shows product statistics: Total Sold, Revenue, In Stock, Inventory Value
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  X, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  Users,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { formatPrice, formatDate, getStockStatus } from '../SwiftCheckout/utils/formatting';
import { getCurrentUser } from '../SwiftCheckout/utils/identity';

export default function ProductPerformanceModal({
  isOpen,
  onClose,
  productId,
  productName
}) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { storeId } = getCurrentUser();
  
  useEffect(() => {
    if (!isOpen || !productId) return;
    
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch sales for this product
        const { data: sales, error: salesError } = await supabase
          .from('dynamic_sales')
          .select('*')
          .eq('dynamic_product_id', Number(productId))
          .eq('store_id', Number(storeId));
        
        if (salesError) throw salesError;
        
        // Fetch inventory
        const { data: inventory, error: invError } = await supabase
          .from('dynamic_inventory')
          .select('*')
          .eq('dynamic_product_id', Number(productId))
          .eq('store_id', Number(storeId))
          .single();
        
        // Fetch product details
        const { data: product, error: prodError } = await supabase
          .from('dynamic_product')
          .select('*')
          .eq('id', Number(productId))
          .single();
        
        if (prodError) throw prodError;
        
        // Calculate stats
        const totalSold = (sales || []).reduce((sum, s) => sum + Number(s.quantity || 0), 0);
        const totalRevenue = (sales || []).reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const availableQty = inventory?.available_qty || 0;
        const purchasePrice = Number(product?.purchase_price) || 0;
        const sellingPrice = Number(product?.selling_price) || 0;
        const inventoryValue = availableQty * purchasePrice;
        const potentialRevenue = availableQty * sellingPrice;
        
        // Top sellers (by created_by_email)
        const sellerStats = {};
        (sales || []).forEach(sale => {
          const email = sale.created_by_email || 'Unknown';
          if (!sellerStats[email]) {
            sellerStats[email] = { qty: 0, revenue: 0 };
          }
          sellerStats[email].qty += Number(sale.quantity) || 0;
          sellerStats[email].revenue += Number(sale.amount) || 0;
        });
        
        const topSellers = Object.entries(sellerStats)
          .map(([email, stats]) => ({ email, ...stats }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);
        
        // Recent sales
        const recentSales = (sales || [])
          .sort((a, b) => new Date(b.sold_at) - new Date(a.sold_at))
          .slice(0, 5);
        
        setStats({
          totalSold,
          totalRevenue,
          availableQty,
          inventoryValue,
          potentialRevenue,
          purchasePrice,
          sellingPrice,
          topSellers,
          recentSales,
          product
        });
      } catch (err) {
        console.error('Error fetching product stats:', err);
        setError('Failed to load product statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [isOpen, productId, storeId]);
  
  if (!isOpen) return null;
  
  const stockStatus = stats ? getStockStatus(stats.availableQty) : null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {productName || 'Product'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Product Performance Overview
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500">Loading statistics...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                    <Package className="w-6 h-6 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Sold</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {stats.totalSold}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
                    <DollarSign className="w-6 h-6 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {formatPrice(stats.totalRevenue)}
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-xl text-center ${stockStatus?.bgColor}`}>
                    <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${stockStatus?.color}`} />
                    <p className="text-xs text-slate-500 dark:text-slate-400">In Stock</p>
                    <p className={`text-2xl font-bold ${stockStatus?.color}`}>
                      {stats.availableQty}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-center">
                    <DollarSign className="w-6 h-6 mx-auto text-amber-600 dark:text-amber-400 mb-2" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Inventory Value</p>
                    <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                      {stats.purchasePrice > 0 
                        ? formatPrice(stats.inventoryValue) 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {/* Top Sellers */}
                {stats.topSellers.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Top Sellers
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {stats.topSellers.map((seller, idx) => (
                        <div 
                          key={seller.email}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                              idx === 1 ? 'bg-slate-100 text-slate-700' :
                              idx === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                              {seller.email}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {seller.qty} units
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatPrice(seller.revenue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recent Sales */}
                {stats.recentSales.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Recent Sales
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {stats.recentSales.map((sale) => (
                        <div 
                          key={sale.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg"
                        >
                          <div>
                            <div className="text-sm text-slate-700 dark:text-slate-300">
                              {sale.quantity} unit{sale.quantity !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(sale.sold_at, 'MMM d, h:mm a')}
                            </div>
                          </div>
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(sale.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No Sales State */}
                {stats.totalSold === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No sales recorded yet for this product.</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}