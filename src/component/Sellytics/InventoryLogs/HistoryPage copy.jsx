/**
 * SwiftInventory - Activity History Page
 * Shows all inventory adjustments with actors and reasons
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Calendar, User, Package, Plus, Minus, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

export default function HistoryPage({ storeId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (storeId) fetchActivities();
  }, [storeId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_inventory_adjustments_logs')
        .select(`
          id,
          dynamic_product_id,
          dynamic_inventory_id,
          updated_by,
          updated_by_email,
          old_quantity,
          new_quantity,
          difference,
          reason,
          metadata,
          created_at,
          dynamic_product (
            id,
            name
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      toast.error('Failed to fetch history');
      console.error(err);
    }
    setLoading(false);
  };

  const filteredActivities = activities.filter(activity => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      activity.dynamic_product?.name?.toLowerCase().includes(searchLower) ||
      activity.updated_by_email?.toLowerCase().includes(searchLower) ||
      activity.reason?.toLowerCase().includes(searchLower);

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.created_at);
      const now = new Date();
      
      if (dateFilter === 'today') {
        matchesDate = activityDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = activityDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = activityDate >= monthAgo;
      }
    }

    let matchesType = true;
    if (typeFilter !== 'all') {
      if (typeFilter === 'increase') {
        matchesType = activity.difference > 0;
      } else if (typeFilter === 'decrease') {
        matchesType = activity.difference < 0;
      }
    }

    return matchesSearch && matchesDate && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity History</h2>
          <p className="text-sm text-slate-500 mt-1">{filteredActivities.length} record{filteredActivities.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchActivities}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, user, or reason..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            {['all', 'today', 'week', 'month'].map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                typeFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('increase')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                typeFilter === 'increase' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Plus className="w-3 h-3" />
              Increase
            </button>
            <button
              onClick={() => setTypeFilter('decrease')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                typeFilter === 'decrease' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Minus className="w-3 h-3" />
              Decrease
            </button>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredActivities.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No activities found</p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.difference > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {activity.difference > 0 ? (
                        <Plus className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Minus className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {activity.dynamic_product?.name || 'Unknown Product'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          activity.difference > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {activity.difference > 0 ? '+' : ''}{activity.difference}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Package className="w-4 h-4" />
                          <span>{activity.old_quantity} → {activity.new_quantity} units</span>
                        </div>
                        
                        {activity.updated_by_email && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <User className="w-4 h-4" />
                            <span className="truncate">{activity.updated_by_email}</span>
                          </div>
                        )}
                      </div>

                      {activity.reason && (
                        <div className="mt-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <p className="text-sm text-slate-600 dark:text-slate-400">{activity.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-1">{new Date(activity.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}