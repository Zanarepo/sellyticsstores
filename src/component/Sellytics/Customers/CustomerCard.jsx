// src/components/Customers/CustomerCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, User, Phone, Mail, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';

function CustomerActions({ onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onEdit();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onDelete();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function CustomerCard({ customer, onEdit, onDelete }) {
  const birthday = customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex items-start gap-4 flex-1 min-w-0 pr-12 sm:pr-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate">
              {customer.fullname}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {customer.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone_number}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Birthday: {birthday}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:block">
          <CustomerActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="absolute top-4 right-4 sm:hidden">
        <CustomerActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </motion.div>
  );
}