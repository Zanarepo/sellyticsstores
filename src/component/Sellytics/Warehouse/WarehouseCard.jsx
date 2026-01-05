import React, { useState } from "react";
import {
  MoreVertical,
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  Edit,
  Trash2,
  Eye,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

export default function WarehouseCard({
  warehouse,
  onView,
  onEdit,
  onDelete,
  onManageClients,
  inventoryCount = 0,
  clientCount = 0
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {/* Card */}
      <div className="group bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden">
        
        {/* Header */}
        <div className="p-4 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <WarehouseIcon className="w-6 h-6 text-white" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                {warehouse.name}
              </h3>
              <span className="text-sm text-slate-500 font-mono">
                {warehouse.code}
              </span>
            </div>
          </div>

          {/* Dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onView(warehouse);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  View Dashboard
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onManageClients(warehouse);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <Users className="h-4 w-4" />
                  Manage Clients
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(warehouse);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(warehouse);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Warehouse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {warehouse.physical_address && (
            <div className="flex items-start gap-2 mb-4 text-sm text-slate-600">
              <MapPin className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
              <span className="line-clamp-2">
                {warehouse.physical_address}
              </span>
            </div>
          )}

          {/* Status badges */}
          <div className="flex items-center gap-2 mb-4">
            {warehouse.is_active ? (
              <span className="px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                Inactive
              </span>
            )}

            {warehouse.is_internal && (
              <span className="px-2 py-1 rounded-full text-xs border border-indigo-200 text-indigo-700">
                Internal
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Package className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
              <span className="block text-2xl font-bold text-slate-900">
                {inventoryCount}
              </span>
              <span className="text-xs text-slate-500">Products</span>
            </div>

            <div className="text-center p-3 rounded-lg bg-slate-50">
              <Users className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <span className="block text-2xl font-bold text-slate-900">
                {clientCount}
              </span>
              <span className="text-xs text-slate-500">Clients</span>
            </div>
          </div>

          {/* Footer action */}
          <button
            onClick={() => onView(warehouse)}
            className="w-full mt-4 px-4 py-2 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition"
          >
            Open Dashboard →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
