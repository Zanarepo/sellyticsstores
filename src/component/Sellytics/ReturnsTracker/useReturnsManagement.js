// src/components/returns-management/useReturnsManagement.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import toast from 'react-hot-toast';

export function useReturnsManagement({ storeId }) {
  const [receiptIdQuery, setReceiptIdQuery] = useState('');
  const [deviceIdQuery, setDeviceIdQuery] = useState('');
  const [queriedReceipts, setQueriedReceipts] = useState([]);
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    receipt_id: '',
    customer_address: '',
    product_name: '',
    device_id: '',
    qty: '',
    amount: '',
    remark: '',
    status: '',
    returned_date: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [commonReasons, setCommonReasons] = useState([]);

  const fetchSalesAndReceipts = useCallback(async () => {
    if (!receiptIdQuery && !deviceIdQuery) {
      setQueriedReceipts([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    try {
      let saleGroupIds = [];
      let salesData = [];

      if (receiptIdQuery) {
        const { data: receiptData, error: receiptError } = await supabase
          .from('receipts')
          .select('id, sale_group_id, receipt_id, customer_address, product_name, phone_number, sales_qty, sales_amount')
          .eq('store_receipt_id', storeId)
          .eq('receipt_id', receiptIdQuery)
          .single();

        if (receiptError || !receiptData) {
          throw new Error(`No receipt found for ID: ${receiptIdQuery}`);
        }

        saleGroupIds = [receiptData.sale_group_id];

        const { data: sales, error: salesError } = await supabase
          .from('dynamic_sales')
          .select(`
            id,
            dynamic_product_id,
            store_id,
            quantity,
            device_id,
            unit_price,
            amount,
            payment_method,
            sale_group_id,
            dynamic_product (
              id,
              name,
              dynamic_product_imeis
            )
          `)
          .eq('store_id', storeId)
          .eq('sale_group_id', receiptData.sale_group_id);

        if (salesError) throw new Error('Failed to fetch sales');

        salesData = sales;
      } else if (deviceIdQuery)
        
        
        
        {
        const { data: sales, error: salesError } = await supabase
          .from('dynamic_sales')
          .select(`
            id,
            dynamic_product_id,
            store_id,
            quantity,
            device_id,
            unit_price,
            amount,
            payment_method,
            sale_group_id,
            dynamic_product (
              id,
              name,
              dynamic_product_imeis
            )
          `)
          .eq('store_id', storeId)
          .or(`device_id.ilike.%${deviceIdQuery}%,dynamic_product_imeis.ilike.%${deviceIdQuery}%`);

        if (salesError) {
          throw new Error('Failed to fetch sales: ' + salesError.message);
        }

        if (!sales || sales.length === 0) {
          throw new Error(`No sales found for device ID: ${deviceIdQuery}`);
        }

        salesData = [];
        sales.forEach(sale => {
          const deviceIds = sale.device_id ? sale.device_id.split(',').map(id => id.trim()) : [];
          const productImeis = sale.dynamic_product?.dynamic_product_imeis
            ? sale.dynamic_product.dynamic_product_imeis.split(',').map(id => id.trim())
            : [];
          const allDeviceIds = [...new Set([...deviceIds, ...productImeis])];

          if (allDeviceIds.includes(deviceIdQuery)) {
            salesData.push({
              ...sale,
              device_id: deviceIdQuery,
            });
          }
        });

        if (salesData.length === 0) {
          throw new Error(`No exact match found for device ID: ${deviceIdQuery}`);
        }

        saleGroupIds = salesData.map(s => s.sale_group_id).filter(id => id != null);
      }

      const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select('id, sale_group_id, receipt_id, customer_address, product_name, phone_number, sales_qty, sales_amount')
        .eq('store_receipt_id', storeId)
        .in('sale_group_id', saleGroupIds);

      if (receiptsError) {
        throw new Error('Failed to fetch receipts: ' + receiptsError.message);
      }

     const combinedData = salesData.map(sale => {
        const product = sale.dynamic_product;
        const receipt = receiptsData.find(r => r.sale_group_id === sale.sale_group_id);
        const deviceIds = deviceIdQuery ? [deviceIdQuery] : (sale.device_id?.split(',').map(id => id.trim()) || []);
        const quantity = deviceIdQuery ? 1 : deviceIds.length;
        const unitPrice = sale.unit_price || sale.amount / sale.quantity;
        const totalAmount = unitPrice * quantity;

        return {
          id: sale.id,
          receipt_id: receipt?.id,
          receipt_code: receipt?.receipt_id || 'Unknown',
          customer_address: receipt?.customer_address || '',
          product_name: product?.name || '',
          device_ids: deviceIds,
          phone_number: receipt?.phone_number || '',
          quantity: quantity,
          unit_price: unitPrice,
          amount: totalAmount,
          payment_method: sale.payment_method,
          sale_group_id: sale.sale_group_id,
        };
      });

      setQueriedReceipts(combinedData);
      setError(null);

      // FIXED AUTO-POPULATION
      if (combinedData.length === 1) {
        const r = combinedData[0];
        setForm({
          receipt_id: r.receipt_id?.toString() || '',
          customer_address: r.customer_address || '',
          product_name: r.product_name || '',
          device_id: r.device_ids?.join(', ') || '',
          qty: r.quantity?.toString() || '',
          amount: r.amount?.toString() || '',
          remark: '',
          status: 'Pending',
          returned_date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setQueriedReceipts([]);
    } finally {
      setIsLoading(false);
    }
  }, [receiptIdQuery, deviceIdQuery, storeId]);



  const fetchReturns = useCallback(async () => {
    if (!storeId) return;

    setIsLoading(true);
    try {
      const { data: receiptsData, error: receiptsError } = await supabase
        .from('receipts')
        .select('id, receipt_id, sale_group_id')
        .eq('store_receipt_id', storeId);

      if (receiptsError) {
        throw new Error('Failed to fetch receipts: ' + receiptsError.message);
      }

      const receiptIds = receiptsData.map(r => r.id);

      const { data: returnsData, error: returnsError } = await supabase
        .from('returns')
        .select('*')
        .in('receipt_id', receiptIds);

      if (returnsError) {
        throw new Error('Failed to fetch returns: ' + returnsError.message);
      }

      const combinedReturns = returnsData.map(ret => {
        const receipt = receiptsData.find(r => r.id === ret.receipt_id);
        return {
          ...ret,
          receipt_code: receipt ? receipt.receipt_id : 'Unknown',
          sale_group_id: receipt ? receipt.sale_group_id : null,
        };
      });

      setReturns(combinedReturns || []);
      setFilteredReturns(combinedReturns || []);

      // Analyze common reasons
      const remarks = combinedReturns.map(r => r.remark).filter(r => r);
      const reasonCounts = remarks.reduce((acc, remark) => {
        acc[remark] = (acc[remark] || 0) + 1;
        return acc;
      }, {});
      const sortedReasons = Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      setCommonReasons(sortedReasons);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchSalesAndReceipts();
  }, [fetchSalesAndReceipts]);


 
const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'receipt_id' && value) {
      const selected = queriedReceipts.find(r => r.receipt_id?.toString() === value);
      if (selected) {
        setForm(prev => ({
          ...prev,
          receipt_id: value,
          customer_address: selected.customer_address || '',
          product_name: selected.product_name || '',
          device_id: selected.device_ids?.join(', ') || '',
          qty: selected.quantity?.toString() || '',
          amount: selected.amount?.toString() || '',
        }));
      }
    }
  };

  const openEdit = r => {
    setEditing(r);
    setForm({
      receipt_id: r.receipt_id.toString(),
      customer_address: r.customer_address || '',
      product_name: r.product_name,
      device_id: r.device_id || '',
      qty: r.qty || '',
      amount: r.amount || '',
      remark: r.remark || '',
      status: r.status || '',
      returned_date: r.returned_date || '',
    });
  };

  const saveReturn = async () => {
    if (!form.receipt_id || isNaN(parseInt(form.receipt_id))) {
      toast.error('Please select a valid receipt.');
      return;
    }

    const returnData = {
      receipt_id: parseInt(form.receipt_id),
      customer_address: form.customer_address,
      product_name: form.product_name,
      device_id: form.device_id || '', // Allow empty for non-ID items
      qty: parseInt(form.qty),
      amount: parseFloat(form.amount),
      remark: form.remark,
      status: form.status,
      returned_date: form.returned_date,
    };

    try {
      if (editing && editing.id) {
        await supabase.from('returns').update(returnData).eq('id', editing.id);
        toast.success('Return updated successfully');
      } else {
        await supabase.from('returns').insert([returnData]);
        toast.success('Return added successfully');
      }

      setEditing(null);
      setForm({
        receipt_id: '',
        customer_address: '',
        product_name: '',
        device_id: '',
        qty: '',
        amount: '',
        remark: '',
        status: '',
        returned_date: '',
      });
      setError(null);
      await fetchReturns();
    } catch (err) {
      toast.error('Failed to save return: ' + err.message);
      setError(err.message);
    }
  };

  const deleteReturn = async (id) => {
    try {
      await supabase.from('returns').delete().eq('id', id);
      toast.success('Return deleted successfully');
      await fetchReturns();
    } catch (err) {
      toast.error('Failed to delete return: ' + err.message);
      setError(err.message);
    }
  };

  const deleteMultiple = async (ids) => {
    if (ids.length === 0) return;
    try {
      await supabase.from('returns').delete().in('id', ids);
      toast.success(`${ids.length} return(s) deleted`);
      await fetchReturns();
    } catch (err) {
      toast.error('Failed to delete returns');
    }
  };

  return {
    receiptIdQuery,
    setReceiptIdQuery,
    deviceIdQuery,
    setDeviceIdQuery,
    queriedReceipts,
    returns,
    filteredReturns,
    searchTerm,
    setSearchTerm,
    editing,
    setEditing,
    form,
    setForm,
    error,
    isLoading,
    commonReasons,
    handleChange,
    openEdit,
    saveReturn,
    deleteReturn,
    deleteMultiple,
    fetchReturns,
  };
}