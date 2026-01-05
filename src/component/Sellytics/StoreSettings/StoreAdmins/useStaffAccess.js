import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

const roleFeatureMap = {
  account: ['sales', 'expenses', 'Products & Pricing Tracker', 'Sales Summary', 'unpaid supplies', 'debts', 'customers', 'Suppliers', 'financials', 'receipts'],
  sales: ['sales', 'products & pricing', 'inventory', 'Sales Summary', 'receipts', 'returns', 'customers', 'Suppliers'],
  'store manager': ['sales', 'inventory', 'receipts', 'returns', 'expenses', 'debts', 'customers', 'Suppliers', 'Stock Transfer', 'Products & Pricing Tracker'],
  marketing: ['customers', 'inventory'],
  admin: ['sales', 'products', 'inventory', 'receipts', 'returns', 'Sales Summary', 'expenses', 'Stock Transfer', 'unpaid supplies', 'debts', 'customers', 'suppliers', 'financials', 'Products & Pricing Tracker'],
  others: ['Products & Pricing Tracker', 'sales', 'Stock Transfer'],
  inventory: [ 'inventory', 'Stock Transfer', 'Products & Pricing Tracker'],
  ceo: ['sales', 'products', 'inventory', 'receipts', 'returns', 'Sales Summary', 'expenses', 'Stock Transfer', 'unpaid supplies', 'debts', 'customers', 'suppliers', 'financials', 'Products & Pricing Tracker'],
  md: ['sales', 'products', 'inventory', 'receipts', 'returns', 'Sales Summary', 'expenses', 'Stock Transfer', 'unpaid supplies', 'debts', 'customers', 'suppliers', 'financials', 'Products & Pricing Tracker'],
 
};

const availableFeatures = [
  'sales', 'Products & Pricing Tracker', 'inventory', 'receipts', 'returns',
  'expenses', 'unpaid supplies', 'debts', 'customers', 'Suppliers',
  'Sales Summary', 'Financials', 'Stock Transfer'
];

export function useStaffAccess() {
  const [storeId, setStoreId] = useState(null);
  const [shopName, setShopName] = useState('Store');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userRoles, setUserRoles] = useState({});
  const [userFeatures, setUserFeatures] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    const storedStoreId = localStorage.getItem('store_id');
    if (!storedStoreId || isNaN(parseInt(storedStoreId))) {
      setError('Invalid store ID');
      toast.error('Invalid store access');
      return;
    }
    setStoreId(parseInt(storedStoreId));

    supabase
      .from('stores')
      .select('shop_name')
      .eq('id', storedStoreId)
      .single()
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load store');
        else setShopName(data?.shop_name || 'Store');
      });
  }, []);

  const loadEmployees = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_users')
        .select('id, full_name, email_address, role, allowed_features')
        .eq('store_id', storeId);

      if (error) throw error;

      const enriched = data.map(emp => ({ ...emp, shop_name: shopName }));
      setEmployees(enriched);

      const roles = {};
      const features = {};
      enriched.forEach(emp => {
        roles[emp.id] = emp.role || '';
        features[emp.id] = emp.allowed_features || [];
      });
      setUserRoles(roles);
      setUserFeatures(features);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [storeId, shopName]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleRoleChange = (userId, role) => {
    setUserRoles(prev => ({ ...prev, [userId]: role }));
    setUserFeatures(prev => ({
      ...prev,
      [userId]: roleFeatureMap[role] || []
    }));
  };

  const handleFeatureToggle = (userId, feature) => {
    setUserFeatures(prev => {
      const current = prev[userId] || [];
      return {
        ...prev,
        [userId]: current.includes(feature)
          ? current.filter(f => f !== feature)
          : [...current, feature]
      };
    });
  };

  const saveChanges = async (userId) => {
    try {
      const { error } = await supabase
        .from('store_users')
        .update({
          role: userRoles[userId],
          allowed_features: userFeatures[userId]
        })
        .eq('id', userId);

      if (error) throw error;
      toast.success('Access updated successfully');
      setEditingUserId(null);
      loadEmployees();
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this staff member? This cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('store_users')
        .delete()
        .eq('id', userId);
      if (error) throw error;
      toast.success('Staff removed');
      loadEmployees();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return {
    employees,
    loading,
    error,
    shopName,
    editingUserId,
    setEditingUserId,
    userRoles,
    userFeatures,
    handleRoleChange,
    handleFeatureToggle,
    saveChanges,
    deleteUser,
    loadEmployees,
    availableFeatures,
    roleFeatureMap
  };
}