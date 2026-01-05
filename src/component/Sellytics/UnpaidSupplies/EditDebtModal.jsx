// src/components/Debts/EditDebtModal/EditDebtModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSave } from 'react-icons/fa';
import { X } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import useDebt from './useDebt';
import ScannerModal from './ScannerModal';
import DebtEntry from './DebtEntry';
import useDebtEntryLogic from './useDebtEntryLogic';
import useScanner from './useScanner';

export const defaultEntry = {
  customer_id: '',
  customer_name: '',
  phone_number: '',
  dynamic_product_id: '',
  product_name: '',
  supplier: '',
  deviceIds: [''],
  deviceSizes: [''],
  qty: 1,
  owed: '',
  deposited: 0,
  date: new Date().toISOString().split('T')[0],
  isUniqueProduct: true,
};

export default function EditDebtModal({ initialData, onClose, onSuccess }) {
  const { addNotification } = useDebt();
  const storeId = localStorage.getItem('store_id');
  const isEdit = !!initialData?.id;

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const {
    debtEntries,
    isLoading,
    handleChange,
    addDebtEntry,
    removeDebtEntry,
    handleScanSuccess,
    addDeviceRow,
    removeDeviceRow,
    saveDebts,
  } = useDebtEntryLogic({
    initialData,
    isEdit,
    storeId,
    customers,
    products,
    addNotification,
    onSuccess,
  });

  // Scanner ref
  const scannerIndicesRef = useRef({ entryIndex: null, deviceIndex: null });

  const { showScanner, openScanner, closeScanner } = useScanner({
    onScan: (code) => {
      const { entryIndex, deviceIndex } = scannerIndicesRef.current;
      if (entryIndex !== null) handleScanSuccess(code, entryIndex, deviceIndex);
    },
  });

  const openScannerWithIndex = ({ entryIndex, deviceIndex }) => {
    scannerIndicesRef.current = { entryIndex, deviceIndex };
    openScanner();
  };

  useEffect(() => {
    const loadData = async () => {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase
          .from('customer')
          .select('id, fullname, phone_number')
          .eq('store_id', storeId),
        supabase
          .from('dynamic_product')
          .select('id, name, dynamic_product_imeis, selling_price')
          .eq('store_id', storeId),
      ]);
      setCustomers(c || []);
      setProducts(p || []);
    };
    loadData();
  }, [storeId]);

  return (
    <>
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
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FaPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {isEdit ? '📝 Edit Debt Entry' : 'Record New Debt'}
                </h2>
                <div className="text-xs text-gray-500">
                  {isEdit
                    ? 'Update existing debt entries'
                    : 'Add new debt entries for customers'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveDebts();
            }}
            className="flex-1 overflow-y-auto p-5 space-y-6"
          >
            {debtEntries.map((entry, index) => (
              <DebtEntry
                key={index}
                entry={entry}
                index={index}
                customers={customers}
                products={products}
                isEdit={isEdit}
                onChange={handleChange}
                onRemove={removeDebtEntry}
                onAddDeviceRow={() => addDeviceRow(index)}
                onRemoveDevice={(entryIdx, deviceIdx) =>
                  removeDeviceRow(entryIdx, deviceIdx)
                }
                onOpenScanner={(deviceIndex) =>
                  openScannerWithIndex({ entryIndex: index, deviceIndex })
                }
              />
            ))}

            {!isEdit && (
              <button
                type="button"
                onClick={addDebtEntry}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Add Another Entry
              </button>
            )}

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    {isEdit ? 'Update Debt' : 'Save Debt'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {showScanner && (
        <ScannerModal
          isOpen={showScanner}
          onScan={(code) => {
            const { entryIndex, deviceIndex } = scannerIndicesRef.current;
            handleScanSuccess(code, entryIndex, deviceIndex);
          }}
          onClose={closeScanner}
        />
      )}
    </>
  );
}
