import { useState, useCallback, useMemo } from 'react';
import { ReturnsService } from './services/returnsService';
import { toast } from 'react-hot-toast';

/**
 * Hook for managing return mutations (create, update, delete)
 */
export function useReturnsActions({ supabase, warehouseId, userId, onSuccess }) {
  const [processing, setProcessing] = useState(false);

  const service = useMemo(() => new ReturnsService(supabase, warehouseId, userId), [supabase, warehouseId, userId]);

  // Create return request
  const createReturn = useCallback(async (returnData) => {
    setProcessing(true);
    try {
      const newReturn = await service.createReturn(returnData);
      toast.success('Return request created successfully');
      onSuccess?.('create', newReturn);
      return newReturn;
    } catch (error) {
      console.error('Error creating return:', error);
      toast.error('Failed to create return request');
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [ onSuccess, service]);

  // Process return inspection
  const processReturn = useCallback(async (returnId, inspectionData) => {
    setProcessing(true);
    try {
      const updatedReturn = await service.processReturn(returnId, inspectionData);
      toast.success('Return processed successfully');
      onSuccess?.('update', updatedReturn);
      return updatedReturn;
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error('Failed to process return');
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [service, onSuccess]);

  // Bulk delete returns
  const bulkDelete = useCallback(async (returnIds) => {
    setProcessing(true);
    try {
      await service.bulkDelete(returnIds);
      toast.success(`${returnIds.length} return(s) deleted`);
      onSuccess?.('bulk_delete', { ids: returnIds });
      return true;
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Failed to delete returns');
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [service, onSuccess]);

  // Export returns
  const exportReturns = useCallback(async (filters) => {
    try {
      const data = await service.exportReturns(filters);
      
      // Convert to CSV
      if (data.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = ['ID', 'Product', 'SKU', 'Client', 'Quantity', 'Status', 'Condition', 'Reason', 'Created', 'Inspected By'];
      const rows = data.map(item => [
        item.id,
        item.product?.product_name || '',
        item.product?.sku || '',
        item.client?.stores?.shop_name || item.client?.external_name || '',
        item.quantity,
        item.status,
        item.condition || '',
        item.reason || '',
        new Date(item.created_at).toLocaleString(),
        item.inspected_by_user?.full_name || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `returns_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Export completed');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    }
  }, [service]);

  return {
    processing,
    createReturn,
    processReturn,
    bulkDelete,
    exportReturns
  };
}