/**
 * CSVUploadModal Component
 * Bulk import products via CSV with offline support
 */
import React, { useState, useRef } from 'react';
import { 
  X, Upload, Download, CheckCircle, XCircle, 
  AlertCircle, Loader2, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import offlineDB from './db/offlineDB';

export default function CSVUploadModal({ storeId, onSuccess, onClose, isOnline }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const fileRef = useRef(null);

  const downloadTemplate = () => {
    const csv = `name,description,purchase_price,selling_price,suppliers_name,device_ids,device_sizes,purchase_qty
iPhone 14 Pro,Black 256GB,450000,650000,Apple Store,IMEI001;IMEI002,256GB;256GB,
Samsung Watch,Smartwatch,80000,120000,Samsung,WATCH001;WATCH002,42mm;46mm,
Rice 50kg,Premium Rice,25000,35000,Rice Mill,,,100
Cement Bag,Dangote Cement,5000,7000,BuildMart,,,50`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast.error('CSV file is empty or invalid');
        setUploading(false);
        return;
      }

      setProgress(20);

      const errors = [];
      const skipped = [];
      const created = [];

      const existingProducts = await offlineDB.getProducts(storeId);
      const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;

        setProgress(20 + Math.round((i / rows.length) * 60));

        if (!row.name?.trim()) {
          errors.push(`Row ${rowNum}: Product name is required`);
          continue;
        }

        if (existingNames.has(row.name.toLowerCase())) {
          skipped.push(row.name);
          continue;
        }

        const deviceIds = row.device_ids 
          ? row.device_ids.split(';').map(s => s.trim()).filter(Boolean)
          : [];
        const deviceSizes = row.device_sizes
          ? row.device_sizes.split(';').map(s => s.trim())
          : [];
        
        const isUnique = deviceIds.length > 0;
        const qty = isUnique 
          ? deviceIds.length 
          : (parseInt(row.purchase_qty) || 0);

        if (!isUnique && qty <= 0) {
          errors.push(`Row ${rowNum}: Must have device_ids or valid purchase_qty`);
          continue;
        }

        const product = {
          name: row.name.trim(),
          description: row.description?.trim() || null,
          purchase_price: parseFloat(row.purchase_price) || 0,
          selling_price: parseFloat(row.selling_price) || 0,
          suppliers_name: row.suppliers_name?.trim() || null,
          purchase_qty: qty,
          is_unique: isUnique,
          dynamic_product_imeis: isUnique ? deviceIds.join(',') : null,
          device_size: isUnique ? deviceSizes.join(',') : null,
          device_id: null,
          store_id: Number(storeId),
          created_at: new Date().toISOString()
        };

        try {
          await offlineDB.addProduct(product, storeId);
          created.push(product.name);
          existingNames.add(row.name.toLowerCase());
        } catch (err) {
          errors.push(`Row ${rowNum}: ${err.message}`);
        }
      }

      setProgress(100);

      setResults({
        success: created.length,
        skipped: skipped.length,
        failed: errors.length,
        errors,
        skippedItems: skipped
      });

      if (created.length > 0) {
        toast.success(`Imported ${created.length} products${!isOnline ? ' (offline)' : ''}`);
        await offlineDB.addNotification(
          'csv_import',
          `Imported ${created.length} products from CSV`
        );
        onSuccess?.();
      } else if (skipped.length > 0) {
        toast('All products already exist', { icon: '⚠️' });
      } else if (errors.length > 0) {
        toast.error(`${errors.length} errors - check details`);
      }
    } catch (err) {
      console.error('CSV parsing error:', err);
      toast.error('Failed to parse CSV file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Import CSV
              </h2>
              <p className="text-xs text-slate-500">
                {isOnline ? 'Online' : 'Offline mode'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-sm text-indigo-700 dark:text-indigo-300">
            <strong>Note:</strong> Duplicate product names are automatically skipped.
            {!isOnline && (
              <span className="block mt-1 text-amber-600">
                Working offline - products will sync when online.
              </span>
            )}
          </div>

          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          />

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Select CSV File
              </>
            )}
          </button>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Processing...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-3">
              {results.success > 0 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {results.success} products imported
                  </span>
                </div>
              )}

              {results.skipped > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-amber-700 dark:text-amber-300">
                    {results.skipped} products skipped (already exist)
                  </span>
                </div>
              )}

              {results.failed > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">{results.failed} errors</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-sm text-red-600 space-y-1">
                    {results.errors.slice(0, 5).map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                    {results.errors.length > 5 && (
                      <div className="text-slate-500">
                        ...and {results.errors.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}