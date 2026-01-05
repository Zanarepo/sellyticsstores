import React, { useState, useEffect } from "react";
import { Loader2, Warehouse } from "lucide-react";

export default function WarehouseFormModal({
  open,
  onClose,
  onSubmit,
  warehouse = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    physical_address: "",
    is_internal: false,
    is_active: true,
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || "",
        code: warehouse.code || "",
        physical_address: warehouse.physical_address || "",
        is_internal: !!warehouse.is_internal,
        is_active: warehouse.is_active !== false,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        physical_address: "",
        is_internal: false,
        is_active: true,
      });
    }
  }, [warehouse, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generateCode = () => {
    const prefix =
      formData.name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .join("")
        .slice(0, 3) || "WH";

    const suffix = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    setFormData((prev) => ({ ...prev, code: `${prefix}-${suffix}` }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold">
            {warehouse ? "Edit Warehouse" : "Create Warehouse"}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-5">

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Warehouse Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Main Distribution Center"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Warehouse Code *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9-]/g, ""),
                  }))
                }
                placeholder="WH-001"
                className="flex-1 px-3 py-2 border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={generateCode}
                className="px-3 py-2 border rounded-md text-sm hover:bg-slate-50"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Unique identifier for scanning and reference
            </p>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Physical Address</label>
            <textarea
              rows={2}
              value={formData.physical_address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  physical_address: e.target.value,
                }))
              }
              placeholder="123 Warehouse St, Industrial Area..."
              className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Internal */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Internal Warehouse</p>
              <p className="text-xs text-slate-500">
                For company-owned stock only
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.is_internal}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_internal: e.target.checked,
                }))
              }
              className="h-5 w-5 accent-indigo-600"
            />
          </div>

          {/* Active */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Active Status</p>
              <p className="text-xs text-slate-500">
                Inactive warehouses are hidden from operations
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="h-5 w-5 accent-indigo-600"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !formData.name || !formData.code}
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {warehouse ? "Update Warehouse" : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
