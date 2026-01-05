// ProductForm.jsx - Main file (UI only, no database logic)
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Hash,
  DollarSign,
  Save,
  ChevronDown,
  Scan,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

import EnhancedBarcodeScanner from "./EnhancedBarcodeScanner";
import { useProductFormLogic } from "./hooks/useProductFormLogic";

const PRODUCT_TYPES = [
  { value: "STANDARD", label: "Standard", desc: "Regular items – quantity counted normally" },
  { value: "SERIALIZED", label: "Serialized", desc: "Each unit has a unique serial/barcode" },
  { value: "BATCH", label: "Batch", desc: "All units share the same barcode – scan to count" },
];

export default function ProductForm({
  warehouseId,
  clientId,
  userId,
  onSuccess,
  onCancel,
  initialData = null,
}) {
  // Local UI state
  const [form, setForm] = useState({
    product_name: initialData?.product_name || "",
    sku: initialData?.sku || "",
    product_type: initialData?.product_type || "STANDARD",
    description: initialData?.metadata?.description || "",
    purchase_price: initialData?.metadata?.purchase_price?.toString() || "",
    markup_percent: initialData?.metadata?.markup_percent?.toString() || "",
    selling_price: initialData?.metadata?.selling_price?.toString() || "",
  });

  const [quantity, setQuantity] = useState(1);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanStats, setScanStats] = useState({ total: 0, unique: 0, duplicates: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Database logic hook
  const { isSubmitting, errors, setErrors, handleSubmit } = useProductFormLogic({
    warehouseId,
    clientId,
    userId,
    initialData,
    onSuccess,
  });

  // Auto-calculate selling price
  useEffect(() => {
    const purchase = parseFloat(form.purchase_price) || 0;
    const markup = parseFloat(form.markup_percent) || 0;
    if (purchase > 0 && markup >= 0) {
      const selling = (purchase * (1 + markup / 100)).toFixed(2);
      setForm(prev => ({ ...prev, selling_price: selling }));
    }
  }, [form.purchase_price, form.markup_percent]);

  // Auto-update quantity from scanner
  useEffect(() => {
    if (form.product_type === "SERIALIZED") {
      setQuantity(scanStats.unique);
    } else if (form.product_type === "BATCH") {
      setQuantity(scanStats.total);
    }
  }, [form.product_type, scanStats]);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();

    let uniqueIdentifiers = null;
    if (form.product_type === "SERIALIZED" && scannerActive) {
      const { data } = await supabase
        .from("warehouse_scan_events")
        .select("scanned_value")
        .eq("session_id", sessionId); // assume sessionId is managed in scanner
      if (data) uniqueIdentifiers = [...new Set(data.map(d => d.scanned_value))];
    }

    await handleSubmit(form, quantity, uniqueIdentifiers);
  };

  const isScannerEligible = form.product_type === "SERIALIZED" || form.product_type === "BATCH";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Form */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            {initialData ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        <div className="p-6">
          <form onSubmit={onFormSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) => handleInputChange("product_name", e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.product_name ? "border-rose-500" : "border-slate-300"
                }`}
              />
              {errors.product_name && (
                <p className="text-sm text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.product_name}
                </p>
              )}
            </div>

            {/* SKU & Product Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="e.g. IP15PM"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Product Type</label>
                <select
                  value={form.product_type}
                  onChange={(e) => handleInputChange("product_type", e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PRODUCT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {PRODUCT_TYPES.find(t => t.value === form.product_type)?.desc}
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  Initial Quantity <span className="text-rose-500">*</span>
                </label>
                {scannerActive && isScannerEligible && (
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                    <Check className="w-3 h-3 mr-1" />
                    Auto-updating
                  </span>
                )}
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full pl-10 pr-4 py-3 text-lg font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Scanner Activation */}
            {isScannerEligible && (
              <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-indigo-900">Barcode Scanner</p>
                    <p className="text-sm text-indigo-700 mt-1">
                      {form.product_type === "SERIALIZED"
                        ? "Scan unique codes for each unit"
                        : "Scan same barcode to count quantity"}
                    </p>
                  </div>
                  {!scannerActive ? (
                    <button
                      type="button"
                      onClick={() => setScannerActive(true)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                    >
                      <Scan className="w-5 h-5" />
                      Activate
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <Check className="w-5 h-5" />
                      Active
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Section */}
            <div className="border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between py-3 px-4 hover:bg-slate-50 rounded-lg transition"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <DollarSign className="w-4 h-4" />
                  Additional Details (Optional)
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Purchase Price, Markup, Selling Price - same as before */}
                    {/* ... (keep your existing pricing fields) */}
                  </div>
                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              {onCancel && (
                <button type="button" onClick={onCancel} className="flex-1 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium">
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {initialData ? "Update" : "Create"} Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side: Scanner */}
      <AnimatePresence>
        {scannerActive && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EnhancedBarcodeScanner
              warehouseId={warehouseId}
              clientId={clientId}
              userId={userId}
              productType={form.product_type}
              onScanUpdate={setScanStats}
              onClose={() => setScannerActive(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder */}
      {!scannerActive && isScannerEligible && (
        <div className="flex items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="text-center">
            <Scan className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-600">Scanner Ready</h3>
            <p className="text-sm text-slate-400 mt-2">Activate to scan {form.product_type.toLowerCase()} items</p>
          </div>
        </div>
      )}
    </div>
  );
}