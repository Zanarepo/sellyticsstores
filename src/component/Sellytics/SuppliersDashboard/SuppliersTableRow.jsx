// src/components/Suppliers/SuppliersTableRow.jsx
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MoreVertical,
  Package,
  Calendar,
  Phone,
  MapPin,
  Mail,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';

function ActionsMenu({ onViewIds, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {onViewIds && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  onViewIds();
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
              >
                <Eye className="w-4 h-4" /> View Serials/IDs
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
            >
              <Edit className="w-4 h-4" /> Edit Entry
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
            >
              <Trash2 className="w-4 h-4" /> Delete Entry
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function SuppliersTableRow({
  item,
  onViewIds,
  onEdit,
  onDelete,
  onViewSupplier
}) {
  const createdAt = useMemo(
    () => new Date(item.created_at).toLocaleDateString(),
    [item.created_at]
  );

  // ✅ SAFE NORMALIZATION (flat or joined data)
  const phone = item.supplier_phone?.trim() || item.supplier?.phone?.trim();
  const email = item.supplier_email?.trim() || item.supplier?.email?.trim();
  const address = item.supplier_address?.trim() || item.supplier?.address?.trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onViewSupplier}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex items-start gap-4 flex-1 min-w-0 pr-12 sm:pr-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
              {item.device_name}
            </h3>

            <p className="text-base font-medium text-indigo-600 dark:text-indigo-400">
              {item.supplier_name || item.supplier?.name || 'N/A'}
            </p>

            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{phone}</span>
                </div>
              )}

              {email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              )}

              {address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{createdAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Quantity</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {item.qty}
            </p>
          </div>

          <div className="hidden sm:block">
            <ActionsMenu
              onViewIds={onViewIds}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="absolute top-4 right-4 sm:hidden">
        <ActionsMenu
          onViewIds={onViewIds}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 sm:hidden text-center text-sm text-slate-500">
        Tap for supplier details • Use ⋮ for actions
      </div>
    </motion.div>
  );
}
