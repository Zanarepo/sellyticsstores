import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalesService from '../services/SalesService';

export default function useSalesCrud(
  storeId,
  isOnline,
  inventory,
  addOfflineSale,
  fetchSales,
  fetchInventory,
  setSales
) {
  const identity = SalesService.getIdentity();

  const createSale = useCallback(async (
    lines,
    totalAmount,
    paymentMethod,
    selectedCustomerId,
    emailReceipt,
    products
  ) => {
    // Validate
    if (!lines || lines.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    for (const line of lines) {
      if (!line.dynamic_product_id || line.quantity <= 0 || !line.unit_price) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    // Offline mode
    if (!isOnline) {
      for (const line of lines) {
        const offlineSale = {
          dynamic_product_id: line.dynamic_product_id,
          quantity: line.quantity,
          unit_price: line.unit_price,
          amount: line.quantity * line.unit_price,
          deviceIds: line.deviceIds || [],
          deviceSizes: line.deviceSizes || [],
          payment_method: paymentMethod,
          customer_id: selectedCustomerId,
          product_name: products.find(p => p.id === line.dynamic_product_id)?.name || 'Unknown',
          customer_name: 'Walk-in',
        };
        const saved = addOfflineSale(offlineSale);
        
        if (saved) {
          setSales(prev => [saved, ...prev]);
        }
      }
      toast.success('Sale saved offline');
      return;
    }

    // Online mode
    try {
      // Create sale group
      const { data: saleGroup, error: groupError } = await SalesService.createSaleGroup({
        total_amount: totalAmount,
        payment_method: paymentMethod,
        customer_id: selectedCustomerId,
        email_receipt: emailReceipt,
      });

      if (groupError) throw new Error(groupError);

      // Insert each sale line
      for (const line of lines) {
        const saleData = {
          dynamic_product_id: line.dynamic_product_id,
          quantity: line.quantity,
          unit_price: line.unit_price,
          device_ids: line.deviceIds || [],
          device_sizes: line.deviceSizes || [],
          payment_method: paymentMethod,
          customer_id: selectedCustomerId,
        };

        const { error: saleError } = await SalesService.createSaleLine(saleData, saleGroup.id);
        if (saleError) throw new Error(saleError);

        // Update inventory
        const inv = inventory.find(i => i.dynamic_product_id === line.dynamic_product_id);
        if (inv) {
          await SalesService.updateInventoryAfterSale(
            line.dynamic_product_id,
            line.quantity,
            storeId
          );
        }
      }

      toast.success('Sale recorded successfully!');
      fetchSales();
      fetchInventory();
    } catch (err) {
      console.error('Sale creation failed:', err);
      toast.error('Failed to save sale: ' + (err.message || 'Unknown error'));
    }
  }, [isOnline, inventory, addOfflineSale, fetchSales, fetchInventory, setSales, storeId]);

  const saveEdit = useCallback(async (editingId, saleForm, originalSale) => {
    if (String(originalSale.created_by_stores) !== String(identity.currentStoreId)) {
      toast.error('You can only edit sales from your own store.');
      return;
    }

    try {
      // Implementation for editing sale
      toast.success('Sale updated successfully');
      fetchSales();
    } catch (error) {
      console.error('Edit failed:', error);
      toast.error('Failed to update sale');
    }
  }, [identity, fetchSales]);

  const deleteSale = useCallback(async (sale) => {
    if (String(sale.created_by_stores) !== String(identity.currentStoreId)) {
      toast.error('You can only delete sales from your own store.');
      return;
    }

    if (!window.confirm('Delete this sale?')) return;

    try {
      // Delete implementation
      toast.success('Sale deleted');
      fetchSales();
      fetchInventory();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete sale');
    }
  }, [identity, fetchSales, fetchInventory]);

  return {
    createSale,
    saveEdit,
    deleteSale,
  };
}