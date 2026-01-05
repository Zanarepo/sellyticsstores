import React, { useState } from "react";
import SupplierRowEditor from "./SupplierRowEditor";
import EmptyState from "./EmptyState";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SuppliersTable({ data, loading, onEdit, onDelete }) {
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deleteConfirmationMode, setDeleteConfirmationMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  if (loading) return <div className="text-center py-16 text-gray-500">Loading suppliers...</div>;
  if (!data || data.length === 0) return <EmptyState />;

  const selectedSupplier = data.find((s) => s.id === openDropdownId);

  const handleCloseModal = () => {
    setOpenDropdownId(null);
    setDeleteConfirmationMode(false);
  };

  const confirmDelete = async () => {
    if (!selectedSupplier) return;

    handleCloseModal();
    setDeletingId(selectedSupplier.id);

    try {
      await onDelete(selectedSupplier.id);
      toast.success("Supplier deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete supplier.");
      setDeletingId(null);
    }
  };

  const openActions = (id) => {
    setDeleteConfirmationMode(false);
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Desktop Table */}
      <div className="hidden md:block -mx-4 md:mx-0">  {/* removes left/right padding on desktop */}
      <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((sup) => (
              <tr
                key={sup.id}
                className={`transition-all duration-500 ease-in-out ${
                  deletingId === sup.id
                    ? "opacity-0 -translate-x-8 scale-95"
                    : "opacity-100 translate-x-0"
                } hover:bg-gray-50 dark:hover:bg-gray-800`}
              >
                <td className="px-6 py-4 font-medium">{sup.supplier_name || "N/A"}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{sup.device_name || "—"}</td>
                <td className="px-6 py-4">{sup.qty ?? "0"}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                  {sup.email || "—"}
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{sup.phone || "—"}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openActions(sup.id)}
                    className="text-lg font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    ...
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Style Compact Table — NO SCROLL */}
<div className="md:hidden">
<table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
      <tr>
        <th className="px-3 py-2 text-left font-bold text-gray-700 dark:text-gray-300">Supplier</th>
        <th className="px-3 py-2 text-center font-bold text-gray-700 dark:text-gray-300">Qty</th>
        <th className="px-3 py-2 text-right font-bold text-gray-700 dark:text-gray-300">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.map((sup) => (
        <tr
          key={sup.id}
          className={`transition-all duration-300 ${
            deletingId === sup.id ? "opacity-0" : "hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
        >
          <td className="px-3 py-4">
            <div className="font-bold text-gray-900 dark:text-white text-sm">
              {sup.supplier_name || "NA"}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">
              {sup.device_name || "No device"}
            </div>
            <div className="text-gray-500 text-[10px] mt-1 truncate">
              {sup.email || sup.phone ? (
                <>
                  {sup.email && <span>{sup.email}</span>}
                  {sup.email && sup.phone && " • "}
                  {sup.phone && <span>{sup.phone}</span>}
                </>
              ) : (
                "—"
              )}
            </div>
          </td>
          <td className="px-3 py-4 text-center">
            <span className="inline-block min-w-[36px] px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full font-bold text-xs">
              {sup.qty ?? "0"}
            </span>
          </td>
          <td className="px-3 py-4 text-right pr-4">
            <button
              onClick={() => openActions(sup.id)}
              className="text-blue-600 dark:text-blue-400 font-black text-xl leading-none hover:scale-125 transition"
            >
              ...
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      {/* Central Action Modal */}
      {openDropdownId && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {!deleteConfirmationMode ? (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.supplier_name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setActiveSupplier(selectedSupplier);
                    handleCloseModal();
                  }}
                  className="w-full text-left px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 text-gray-700 dark:text-gray-200"
                >
                  Edit Supplier
                </button>
                <button
                  onClick={() => setDeleteConfirmationMode(true)}
                  className="w-full text-left px-6 py-4 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition flex items-center gap-3"
                >
                  Delete Supplier
                </button>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Supplier?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmationMode(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition shadow-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {activeSupplier && (
        <SupplierRowEditor
          key={activeSupplier.id}
          supplier={activeSupplier}
          onClose={() => setActiveSupplier(null)}
          onSave={onEdit}
        />
      )}
    </>
  );
}