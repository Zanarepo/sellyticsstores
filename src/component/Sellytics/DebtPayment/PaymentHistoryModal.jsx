// src/components/Debt/PaymentHistoryModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/currencyContext';

const paymentMethods = ['Cash', 'Card', 'Transfer'];

export default function PaymentHistoryModal({
  debt,
  onClose,
  onUpdate,
  canEdit = true,
  canDelete = false,
}) {
  const { formatPrice } = useCurrency();
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({
    amount_paid: '',
    payment_date: '',
    payment_method: '',
  });
  const [loading, setLoading] = useState(false);

  const storeId = localStorage.getItem('store_id');

  const startEdit = (payment) => {
    setEditingPayment(payment);
    setEditForm({
      amount_paid: payment.amount_paid,
      payment_date: new Date(payment.payment_date).toISOString().slice(0, 16),
      payment_method: payment.payment_method || '',
    });
  };

  const cancelEdit = () => {
    setEditingPayment(null);
    setEditForm({ amount_paid: '', payment_date: '', payment_method: '' });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (Number(editForm.amount_paid) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('debt_payment_history')
      .update({
        amount_paid: Number(editForm.amount_paid),
        payment_date: new Date(editForm.payment_date).toISOString(),
        payment_method: editForm.payment_method,
      })
      .eq('id', editingPayment.id);

    if (error) {
      toast.error('Failed to update payment');
    } else {
      toast.success('Payment updated');
      cancelEdit();
      onUpdate();
    }
    setLoading(false);
  };

  const deletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment record?')) return;

    setLoading(true);
    const { error } = await supabase
      .from('debt_payment_history')
      .delete()
      .eq('id', paymentId)
      .eq('store_id', storeId);

    if (error) {
      toast.error('Failed to delete payment');
    } else {
      toast.success('Payment deleted');
      onUpdate();
    }
    setLoading(false);
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Payment History
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {debt.customer_name} — Balance: {formatPrice(debt.remaining)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          {debt.payment_history.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No payments recorded yet.
            </p>
          ) : (
            debt.payment_history
              .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
              .map((payment) => (
                <div
                  key={payment.id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
                >
                  {editingPayment?.id === payment.id ? (
                    <form onSubmit={saveEdit} className="space-y-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount_paid}
                        onChange={(e) =>
                          setEditForm({ ...editForm, amount_paid: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700"
                        required
                      />
                      <input
                        type="datetime-local"
                        value={editForm.payment_date}
                        onChange={(e) =>
                          setEditForm({ ...editForm, payment_date: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700"
                        required
                      />
                      <select
                        value={editForm.payment_method}
                        onChange={(e) =>
                          setEditForm({ ...editForm, payment_method: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700"
                        required
                      >
                        <option value="">Select Method</option>
                        {paymentMethods.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(payment.amount_paid)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(payment.payment_date).toLocaleString()}
                        </div>
                        {payment.payment_method && (
                          <p className="text-sm text-slate-500">
                            Method: <span className="font-medium">{payment.payment_method}</span>
                          </p>
                        )}
                      </div>

                      {(canEdit || canDelete) && (
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <button
                              onClick={() => startEdit(payment)}
                              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                              <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => deletePayment(payment.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}