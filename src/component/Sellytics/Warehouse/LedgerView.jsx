import React, { useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const MOVEMENT_TYPES = {
  IN: { icon: ArrowDownCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  OUT: { icon: ArrowUpCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ADJUST: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50' },
  TRANSFER: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' }
};

const SUBTYPES = {
  STANDARD: { label: 'Standard', color: 'bg-slate-100 text-slate-700' },
  RETURN_FROM_STORE: { label: 'Return from Store', color: 'bg-amber-100 text-amber-700' },
  RETURN_TO_SUPPLIER: { label: 'Return to Supplier', color: 'bg-red-100 text-red-700' },
  DAMAGE: { label: 'Damage', color: 'bg-red-100 text-red-700' },
  LOSS: { label: 'Loss', color: 'bg-red-100 text-red-700' }
};

export default function LedgerView({ ledgerEntries = [], products = [], clients = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.product_name || 'Unknown Product';
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.external_name || `Store #${client?.store_id}` || 'Unknown Client';
  };

  const filteredEntries = ledgerEntries
    .filter(entry => {
      const matchesSearch = 
        getProductName(entry.warehouse_product_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(entry.client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || entry.movement_type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_date || a.created_at);
      const dateB = new Date(b.created_date || b.created_at);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Direction', 'Product', 'Client', 'Quantity', 'Condition', 'Notes'];
    const rows = filteredEntries.map(entry => [
      format(new Date(entry.created_date || entry.created_at), 'yyyy-MM-dd HH:mm'),
      entry.movement_type,
      entry.direction,
      getProductName(entry.warehouse_product_id),
      getClientName(entry.client_id),
      entry.quantity,
      entry.item_condition || 'GOOD',
      entry.notes || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Movement Ledger
          </h2>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Filter Type */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none rounded-lg border border-slate-300 pl-10 pr-8 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="all">All Types</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
                <option value="ADJUST">Adjustments</option>
                <option value="TRANSFER">Transfers</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort Button */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition"
            >
              {sortOrder === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition font-medium text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-700 w-36">Date & Time</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 w-28">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700">Client</th>
                <th className="text-right py-3 px-4 font-medium text-slate-700">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-slate-700 w-28">Condition</th>
                <th className="w-12 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-500">
                      <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>No movement records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const typeConfig = MOVEMENT_TYPES[entry.movement_type] || MOVEMENT_TYPES.TRANSFER;
                    const subtypeConfig = SUBTYPES[entry.movement_subtype || 'STANDARD'];
                    const Icon = typeConfig.icon;
                    const isExpanded = expandedEntry === entry.id;

                    return (
                      <React.Fragment key={entry.id}>
                        {/* Main Row */}
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                          className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 ${isExpanded ? 'bg-slate-50' : ''}`}
                        >
                          <td className="py-4 px-4 font-mono text-xs text-slate-600">
                            {format(new Date(entry.created_date || entry.created_at), 'MMM d, HH:mm')}
                          </td>
                          <td className="py-4 px-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${typeConfig.bg}`}>
                              <Icon className={`h-4 w-4 ${typeConfig.color}`} />
                              <span className={`text-xs font-semibold ${typeConfig.color}`}>
                                {entry.direction}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-slate-900">
                              {getProductName(entry.warehouse_product_id)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-600">
                            {getClientName(entry.client_id)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-bold text-lg ${entry.direction === 'IN' ? 'text-emerald-600' : 'text-orange-600'}`}>
                              {entry.direction === 'IN' ? '+' : '-'}{entry.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              entry.item_condition === 'DAMAGED' ? 'bg-red-100 text-red-700' :
                              entry.item_condition === 'EXPIRED' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {entry.item_condition || 'GOOD'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-400" />
                            )}
                          </td>
                        </motion.tr>

                        {/* Expanded Details Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <td colSpan={7} className="bg-slate-50/70 px-6 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                  <div>
                                    <p className="text-slate-500 mb-1">Subtype</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${subtypeConfig.color}`}>
                                      {subtypeConfig.label}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 mb-1">Reference</p>
                                    <p className="font-mono text-xs text-slate-700">
                                      {entry.reference_type ? `${entry.reference_type} #${entry.reference_id}` : '—'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 mb-1">Created By</p>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-slate-400" />
                                      <span className="text-sm text-slate-700">
                                        {entry.created_by || 'System'}
                                      </span>
                                    </div>
                                  </div>

                                  {entry.unique_identifiers?.length > 0 && (
                                    <div className="md:col-span-3">
                                      <p className="text-slate-500 mb-2">Serial Numbers</p>
                                      <div className="flex flex-wrap gap-2">
                                        {entry.unique_identifiers.map((serial, idx) => (
                                          <span
                                            key={idx}
                                            className="inline-block px-3 py-1 rounded-full border border-slate-300 bg-slate-50 font-mono text-xs text-slate-700"
                                          >
                                            {serial}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {entry.notes && (
                                    <div className="md:col-span-3">
                                      <p className="text-slate-500 mb-1">Notes</p>
                                      <p className="text-slate-700 leading-relaxed">{entry.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}