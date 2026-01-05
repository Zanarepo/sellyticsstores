/**
 * SwiftCheckout - Sales CRUD Hook
 */
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../supabaseClient';
import { getCurrentUser } from '../utils/identity';
import { deviceIdsToString } from '../utils/validation';

export default function useSalesCrud(
  storeId,
  isOnline,
  inventory,
  addOfflineSale,
  fetchSales,
  fetchInventory,
  setSales
) {
  const currentUserId = localStorage.getItem('user_id');
  const currentStoreId = localStorage.getItem('store_id');
  const currentUserEmail = localStorage.getItem('user_email')?.trim().toLowerCase();

  const createSale = useCallback(async (
    lines,
    totalAmount,
    paymentMethod,
    selectedCustomerId,
    emailReceipt,
    products
  ) => {
    if (!isOnline) {
      for (const line of lines) {
        const offlineSale = {
          dynamic_product_id: line.dynamic_product_id,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.quantity * line.unit_price,
          device_id: line.deviceIds.filter(id => id.trim()).join(',') || null,
          device_size: line.deviceSizes.filter(s => s.trim()).join(',') || null,
          payment_method: paymentMethod,
          customer_id: selectedCustomerId,
          created_by_user_id: currentUserId ? Number(currentUserId) : null,
          created_by_stores: currentStoreId ? Number(currentStoreId) : null,
          created_by_email: currentUserEmail,
          sold_at: new Date().toISOString(),
        };
        const saved = addOfflineSale(offlineSale);
        setSales(prev => [{
          ...saved,
          product_name: products.find(p => p.id === line.dynamic_product_id)?.name || 'Unknown'
        }, ...prev]);
      }
      toast.success('Sale saved offline');
      return;
    }

    try {
      const { data: saleGroup, error: groupError } = await supabase
        .from('sale_groups')
        .insert({
          store_id: Number(currentStoreId),
          total_amount: totalAmount,
          payment_method: paymentMethod,
          customer_id: selectedCustomerId,
          email_receipt: emailReceipt,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      for (const line of lines) {
        const saleData = {
          store_id: Number(currentStoreId),
          sale_group_id: saleGroup.id,
          dynamic_product_id: line.dynamic_product_id,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.quantity * line.unit_price,
          device_id: line.deviceIds.filter(id => id.trim()).join(',') || null,
          device_size: line.deviceSizes.filter(s => s.trim()).join(',') || null,
          payment_method: paymentMethod,
          customer_id: selectedCustomerId,
          created_by_user_id: currentUserId ? Number(currentUserId) : null,
          created_by_stores: Number(currentStoreId),
          created_by_email: currentUserEmail,
        };

        const { error: saleError } = await supabase
          .from('dynamic_sales')
          .insert(saleData);

        if (saleError) throw saleError;

        const inv = inventory.find(i => i.dynamic_product_id === line.dynamic_product_id);
        if (inv) {
          await supabase
            .from('dynamic_inventory')
            .update({ available_qty: inv.available_qty - line.quantity })
            .eq('id', inv.id);
        }
      }

      toast.success('Sale recorded successfully!');
      fetchSales();
      fetchInventory();
    } catch (err) {
      console.error('Sale creation failed:', err);
      toast.error('Failed to save sale: ' + (err.message || 'Unknown error'));
    }
  }, [isOnline, inventory, addOfflineSale, fetchSales, fetchInventory, setSales, currentUserId, currentStoreId, currentUserEmail]);

  const saveEdit = useCallback(async (editingId, saleForm, originalSale) => {
    if (String(originalSale.created_by_stores) !== currentStoreId) {
      toast.error('You can only edit sales from your own store.');
      return;
    }

    try {
      const updateData = {
        quantity: saleForm.quantity,
        unit_price: saleForm.unit_price,
        amount: saleForm.quantity * saleForm.unit_price,
        device_id: deviceIdsToString(saleForm.deviceIds),
        device_size: deviceIdsToString(saleForm.deviceSizes),
        payment_method: saleForm.payment_method,
        customer_id: saleForm.customer_id || null,
      };

      const { error } = await supabase
        .from('dynamic_sales')
        .update(updateData)
        .eq('id', editingId);

      if (error) throw error;

      const qtyDiff = saleForm.quantity - originalSale.quantity;
      if (qtyDiff !== 0) {
        const inv = inventory.find(i => i.dynamic_product_id === originalSale.dynamic_product_id);
        if (inv) {
          await supabase
            .from('dynamic_inventory')
            .update({ available_qty: inv.available_qty - qtyDiff })
            .eq('id', inv.id);
        }
      }

      toast.success('Sale updated successfully');
      fetchSales();
      fetchInventory();
    } catch (err) {
      console.error('Edit failed:', err);
      toast.error('Failed to update sale');
    }
  }, [currentStoreId, inventory, fetchSales, fetchInventory]);

  const deleteSale = useCallback(async (sale) => {
    if (String(sale.created_by_stores) !== currentStoreId) {
      toast.error('You can only delete sales from your own store.');
      return;
    }

    if (!window.confirm('Delete this sale?')) return;

    try {
      const { error } = await supabase
        .from('dynamic_sales')
        .delete()
        .eq('id', sale.id);

      if (error) throw error;

      const inv = inventory.find(i => i.dynamic_product_id === sale.dynamic_product_id);
      if (inv) {
        await supabase
          .from('dynamic_inventory')
          .update({ available_qty: inv.available_qty + sale.quantity })
          .eq('id', inv.id);
      }

      toast.success('Sale deleted');
      fetchSales();
      fetchInventory();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete sale');
    }
  }, [currentStoreId, inventory, fetchSales, fetchInventory]);

  return {
    createSale,
    saveEdit,
    deleteSale,
  };
}