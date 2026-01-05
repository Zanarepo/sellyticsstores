import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast, { Toaster } from 'react-hot-toast';
import ReceiptPreview from './ReceiptPreview';
import useReceiptCustomization from './useReceiptCustomization';

export default function ReceiptView() {
  const { receipt_id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [saleGroup, setSaleGroup] = useState(null);
  const [store, setStore] = useState(null);
  const [productGroups, setProductGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const printRef = useRef();

  const { styles } = useReceiptCustomization();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch receipt
        const { data: receiptData, error: receiptError } = await supabase
          .from('receipts')
          .select('*')
          .eq('receipt_id', receipt_id)
          .single();

        if (receiptError) throw new Error('Receipt not found');
        setReceipt(receiptData);

        // Fetch sale group with dynamic sales
        const { data: saleGroupData, error: saleGroupError } = await supabase
          .from('sale_groups')
          .select(`
            *,
            dynamic_sales (
              id,
              device_id,
              quantity,
              amount,
              dynamic_product (
                id,
                name,
                selling_price
              )
            )
          `)
          .eq('id', receiptData.sale_group_id)
          .single();

        if (saleGroupError) throw new Error('Sale information not found');
        setSaleGroup(saleGroupData);

        // Fetch store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('shop_name, business_address, phone_number, email_address')
          .eq('id', receiptData.store_receipt_id)
          .single();

        if (storeError) throw new Error('Store information not found');
        setStore(storeData);

        // Build product groups
        const groups = saleGroupData.dynamic_sales.map(sale => ({
          productId: sale.dynamic_product.id,
          productName: sale.dynamic_product.name,
          deviceIds: sale.device_id?.split(',').filter(id => id.trim()) || [],
          quantity: sale.quantity,
          unitPrice: sale.amount / sale.quantity,
          totalAmount: sale.amount
        }));
        setProductGroups(groups);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (receipt_id) {
      fetchReceipt();
    }
  }, [receipt_id]);

  const handleDownload = async () => {
    const element = printRef.current;
    if (!element) return;

    const toastId = toast.loading('Generating PDF...');

    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 297]
      });

      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${receipt_id}.pdf`);
      
      toast.success('Receipt downloaded!', { id: toastId });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center max-w-md border-2 border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Receipt Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'The receipt you are looking for does not exist or has been deleted.'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition shadow-lg"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Receipt
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              {store?.shop_name}
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Receipt ID</p>
                  <p className="font-bold text-slate-900 dark:text-white">{receipt.receipt_id}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900">
              <ReceiptPreview
                ref={printRef}
                store={store}
                receipt={receipt}
                saleGroup={saleGroup}
                productGroups={productGroups}
                styles={styles}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 rounded-2xl font-medium transition-colors shadow-lg"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium transition-colors shadow-lg shadow-indigo-500/30"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
          </div>
        </div>
      </div>
    </>
  );
}