import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

export default function useReceiptManager(storeId, userEmail) {
  const [store, setStore] = useState(null);
  const [saleGroups, setSaleGroups] = useState([]);
  const [filteredSaleGroups, setFilteredSaleGroups] = useState([]);
  const [selectedSaleGroup, setSelectedSaleGroup] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [canDelete, setCanDelete] = useState(false); 

  // Helper: Check if user is store owner
  const checkIsOwner = useCallback(async (storeId, email) => {
    if (!email || !storeId) return false;

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('stores')
      .select('email_address')
      .eq('id', storeId)
      .single();

    if (error || !data) {
      console.error('checkIsOwner error:', error);
      return false;
    }

    const isOwner = data.email_address?.trim().toLowerCase() === cleanEmail;
    console.log('checkIsOwner result:', { storeId, cleanEmail, ownerEmail: data.email_address, isOwner });
    return isOwner;
  }, []);

  // Helper: Check if user is store staff
  const checkIsStoreUser = useCallback(async (storeId, email) => {
    if (!email || !storeId) return false;

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('store_users')
      .select('id')
      .eq('store_id', storeId)
      .eq('email_address', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('checkIsStoreUser error:', error);
      return false;
    }

    const isStaff = !!data;
    console.log('checkIsStoreUser result:', { storeId, cleanEmail, isStaff });
    return isStaff;
  }, []);

  // Fetch store details
  useEffect(() => {
    if (!storeId) return;

    const fetchStore = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('shop_name, business_address, phone_number, email_address')
        .eq('id', storeId)
        .single();

      if (error) {
        console.error('Store fetch error:', error);
        toast.error('Failed to load store details');
      } else {
        setStore(data);
      }
    };

    fetchStore();
  }, [storeId]);

  // Fetch sale groups with real-time updates
  const fetchSaleGroups = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sale_groups')
        .select(`
          id,
          store_id,
          total_amount,
          payment_method,
          created_at,
          customer_id,
          created_by_email,
          dynamic_sales (
            id,
            device_id,
            quantity,
            amount,
            dynamic_product (
              id,
              name,
              selling_price,
              dynamic_product_imeis
            )
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSaleGroups(data || []);
    } catch (err) {
      console.error('Sale groups fetch error:', err);
      toast.error('Failed to load sale groups');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchSaleGroups();

    if (!storeId) return;

    const subscription = supabase
      .channel('sale_groups_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sale_groups', filter: `store_id=eq.${storeId}` },
        () => fetchSaleGroups()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [storeId, fetchSaleGroups]);

  // Apply filtering based on user role (owner vs staff vs unauthorized)
  useEffect(() => {
    if (!userEmail || !storeId || saleGroups.length === 0) {
      setFilteredSaleGroups(saleGroups);
      setFilteredReceipts(receipts);
      setCanDelete(false);
      if (selectedSaleGroup && saleGroups.length > 0 && !selectedSaleGroup) {
        setSelectedSaleGroup(saleGroups[0]);
      }
      return;
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    const applyFilter = async () => {
      const isOwner = await checkIsOwner(storeId, cleanEmail);
      const isStaff = await checkIsStoreUser(storeId, cleanEmail);

      console.log('User role for filtering:', { isOwner, isStaff, cleanEmail, totalSaleGroups: saleGroups.length });

      if (isOwner) {
        setFilteredSaleGroups(saleGroups); // Owner sees everything
        setFilteredReceipts(receipts);
        setCanDelete(true);
      } else if (isStaff) {
        // Staff: only sales they created (fallback to show if created_by_email is null or matches)
        const mySaleGroups = saleGroups.filter(sg => !sg.created_by_email || sg.created_by_email?.trim().toLowerCase() === cleanEmail);
        setFilteredSaleGroups(mySaleGroups);

        const mySaleGroupIds = mySaleGroups.map(sg => sg.id);
        const myReceipts = receipts.filter(r => mySaleGroupIds.includes(r.sale_group_id));
        setFilteredReceipts(myReceipts);
        setCanDelete(false);
      } else {
        // Unauthorized: see nothing
        setFilteredSaleGroups([]);
        setFilteredReceipts([]);
        setCanDelete(false);
      }

      // Adjust selectedSaleGroup if it's no longer in filtered list
      if (selectedSaleGroup && !filteredSaleGroups.some(sg => sg.id === selectedSaleGroup.id)) {
        setSelectedSaleGroup(filteredSaleGroups[0] || null);
      }

      console.log('Filtered sale groups count:', filteredSaleGroups.length);
    };

    applyFilter();
  }, [receipts, saleGroups, userEmail, storeId, checkIsOwner, checkIsStoreUser, selectedSaleGroup]);

  // FIXED: Safe fetchReceipts - no errors when sale/receipt is deleted
  const fetchReceipts = useCallback(async () => {
    if (!selectedSaleGroup) {
      setReceipts([]);
      setSelectedReceipt(null);
      return;
    }

    try {
      const { data: receiptData, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('sale_group_id', selectedSaleGroup.id);

      if (error) {
        if (error.code === 'PGRST116' || error.code === '23503') {
          setReceipts([]);
          setSelectedReceipt(null);
          return;
        }
        throw error;
      }

      // Auto-create receipt only if sale has items and no receipt exists
      if (receiptData?.length === 0 && selectedSaleGroup.dynamic_sales?.length > 0) {
        const totalQuantity = selectedSaleGroup.dynamic_sales.reduce((sum, s) => sum + s.quantity, 0);
        const totalAmount = selectedSaleGroup.dynamic_sales.reduce((sum, s) => sum + s.amount, 0);

        let customer_name = '';
        let phone_number = '';
        let customer_address = '';

        if (selectedSaleGroup.customer_id) {
          const { data: customer } = await supabase
            .from('customer')
            .select('fullname, phone_number, address')
            .eq('id', selectedSaleGroup.customer_id)
            .single();

          if (customer) {
            customer_name = customer.fullname || '';
            phone_number = customer.phone_number || '';
            customer_address = customer.address || '';
          }
        }

        const firstSale = selectedSaleGroup.dynamic_sales[0];

        const receiptInsert = {
          store_receipt_id: selectedSaleGroup.store_id,
          sale_group_id: selectedSaleGroup.id,
          product_id: firstSale.dynamic_product.id,
          sales_amount: totalAmount,
          sales_qty: totalQuantity,
          product_name: firstSale.dynamic_product.name,
          device_id: firstSale.device_id || null,
          customer_name,
          customer_address,
          phone_number,
          warranty: '',
          date: new Date(selectedSaleGroup.created_at).toISOString(),
          receipt_id: `RCPT-${selectedSaleGroup.id}`
        };

        const { data: newReceipt, error: insertError } = await supabase
          .from('receipts')
          .insert([receiptInsert])
          .select()
          .single();

        if (insertError) {
          console.error('Auto-create receipt failed:', insertError);
        } else {
          receiptData = [newReceipt];
        }
      }

      // Clean duplicates (keep latest)
      if (receiptData?.length > 1) {
        const latest = receiptData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        await supabase
          .from('receipts')
          .delete()
          .eq('sale_group_id', selectedSaleGroup.id)
          .neq('id', latest.id);
        receiptData = [latest];
      }

      setReceipts(receiptData || []);
      setSelectedReceipt(receiptData?.[0] || null);
    } catch (err) {
      console.error('Unexpected receipt error:', err);
      setReceipts([]);
      setSelectedReceipt(null);
    }
  }, [selectedSaleGroup]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const updateReceipt = useCallback(async (receiptId, updates) => {
    try {
      if (selectedSaleGroup?.customer_id) {
        await supabase
          .from('customer')
          .update({
            fullname: updates.customer_name,
            phone_number: updates.phone_number,
            address: updates.customer_address
          })
          .eq('id', selectedSaleGroup.customer_id);
      }

      const { error } = await supabase
        .from('receipts')
        .update(updates)
        .eq('id', receiptId);

      if (error) throw error;

      await fetchReceipts();
      toast.success('Receipt updated successfully');
      return true;
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update receipt');
      return false;
    }
  }, [selectedSaleGroup, fetchReceipts]);

  const getProductGroups = useCallback(() => {
    if (!selectedSaleGroup?.dynamic_sales) return [];

    return selectedSaleGroup.dynamic_sales.map(sale => {
      const product = sale.dynamic_product;
      const deviceIds = sale.device_id?.split(',').filter(id => id.trim()) || [];
      const quantity = sale.quantity;
      const unitPrice = sale.amount / sale.quantity;

      return {
        productId: product.id,
        productName: product.name,
        deviceIds,
        quantity,
        unitPrice,
        totalAmount: sale.amount
      };
    });
  }, [selectedSaleGroup]);

  const deleteReceipt = useCallback(async (receiptId) => {
    if (!window.confirm('Delete this receipt and the ENTIRE sale (all items included)? This cannot be undone.')) {
      return false;
    }

    try {
      const { data: receipt, error: findError } = await supabase
        .from('receipts')
        .select('sale_group_id')
        .eq('id', receiptId)
        .single();

      if (findError || !receipt) {
        toast.error('Receipt not found');
        return false;
      }

      const saleGroupId = receipt.sale_group_id;

      await supabase.from('dynamic_sales').delete().eq('sale_group_id', saleGroupId);
      await supabase.from('receipts').delete().eq('sale_group_id', saleGroupId);
      await supabase.from('sale_groups').delete().eq('id', saleGroupId);

      setSelectedSaleGroup(null);
      setSelectedReceipt(null);
      setReceipts([]);

      await fetchSaleGroups();

      toast.success('Sale and receipt permanently deleted');
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete sale');
      return false;
    }
  }, [fetchSaleGroups]);

  return {
    store,
    saleGroups,
    filteredSaleGroups,
    selectedSaleGroup,
    setSelectedSaleGroup,
    receipts,
    selectedReceipt,
    setSelectedReceipt,
    loading,
    updateReceipt,
    deleteReceipt,
    getProductGroups,
    refreshReceipts: fetchReceipts,
    filteredReceipts,
    canDelete
  };
}