// src/components/Sellytics/Debt/DebtTracker.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { toast } from 'react-toastify';
import DebtForm from './DebtForm';
import DebtHistory from './DebtHistory';
import { getUserPermission } from '../../../utils/accessControl';
import { MoreVertical } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';

export default function DebtTracker() {
  const storeId = Number(localStorage.getItem('store_id'));
  const userEmail = localStorage.getItem('user_email');

  const { formatCurrency } = useCurrency();

  const [customers, setCustomers] = useState([]);
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false,
    canView: false
  });

  /* ---------------- PERMISSIONS ---------------- */
  useEffect(() => {
    if (!storeId || !userEmail) return;

    getUserPermission(storeId, userEmail).then(setPermissions);
  }, [storeId, userEmail]);

  /* ---------------- DATA ---------------- */
  useEffect(() => {
    fetchCustomers();
  }, [storeId, fetchCustomers]);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customer')
      .select('id, fullname')
      .eq('store_id', storeId)
      .order('fullname');

    if (error) toast.error('Failed to load customers');
    else setCustomers(data || []);
  };

  /* ---------------- CREATE DEBT ---------------- */
  const handleAddDebt = async ({ customer_id, amount_owed }) => {
    if (!permissions.canEdit) {
      toast.error('You do not have permission to add debts');
      return false;
    }

    const payload = {
      store_id: storeId,
      customer_id: Number(customer_id),
      amount_owed: Number(amount_owed),
      amount_deposited: 0,
      debt_date: new Date().toISOString(),
      created_by_owner: storeId,
      created_by_user: null
    };

    const { error } = await supabase.from('debt_tracker').insert(payload);

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success(`Debt added (${formatCurrency(amount_owed)})`);
    return true;
  };

  if (!permissions.canView) {
    return (
      <div className="p-6 text-center text-gray-500">
        You do not have access to view debts.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">Debt Tracker</h2>
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </div>

      {permissions.canEdit && (
        <DebtForm
          customers={customers}
          onSubmit={handleAddDebt}
        />
      )}

      <DebtHistory
        storeId={storeId}
        permissions={permissions}
      />
    </div>
  );
}
