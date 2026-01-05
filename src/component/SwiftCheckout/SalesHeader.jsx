/**
 * SwiftCheckout - Sales Header Component
 */
import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Plus, Search, List, Calendar, CalendarDays, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from "../SwiftCheckout/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../SwiftCheckout/ui/select';
import { motion } from 'framer-motion';

const viewOptions = [
  { value: 'list', label: 'List', icon: List },
  { value: 'daily', label: 'Daily', icon: Calendar },
  { value: 'weekly', label: 'Weekly', icon: CalendarDays },
];

export default function SalesHeader({
  viewMode,
  setViewMode,
  search,
  setSearch,
  onNewSale,
  isMultiStoreOwner,
  ownedStores,
  selectedStoreId,
  setSelectedStoreId,
  isOnline,
  pendingCount,
  onSync,
  isSyncing,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Top Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sales
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and track all your sales
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Offline Indicator */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            
            {pendingCount > 0 && (
              <button
                onClick={onSync}
                disabled={!isOnline || isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-amber-200 text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync ({pendingCount})
              </button>
            )}
          </div>

          <button
            onClick={onNewSale}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </button>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {viewOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setViewMode(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === value
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Multi-store selector */}
        {isMultiStoreOwner && (
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="w-40 bg-white dark:bg-slate-800">
              <SelectValue placeholder="Store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {ownedStores?.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.shop_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </motion.div>
  );
}