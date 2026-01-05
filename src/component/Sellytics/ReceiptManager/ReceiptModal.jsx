import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, Share2, Edit, FileText, Trash2, QrCode } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import ReceiptPreview from './ReceiptPreview';
import ReceiptEditModal from './ReceiptEditModal';

export default function ReceiptModal({ 
  isOpen, 
  onClose, 
  receipt, 
  saleGroup, 
  store, 
  productGroups,
  styles,
  onUpdate,
  onDelete,
  canDelete
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const printRef = useRef();

  if (!isOpen || !receipt || !saleGroup) return null;

  const receiptUrl = `${window.location.origin}/receipt/${receipt.receipt_id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(receiptUrl)}`;

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
      pdf.save(`receipt-${receipt.receipt_id}.pdf`);
      
      toast.success('Receipt downloaded!', { id: toastId });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt', { id: toastId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receipt.receipt_id}`,
          text: `View your receipt from ${store?.shop_name}`,
          url: receiptUrl
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(receiptUrl);
    toast.success('Receipt link copied to clipboard!');
  };

  const handleDelete = async () => {
    if (await onDelete(saleGroup.id)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Receipt Details
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {receipt.receipt_id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* QR Code Section */}
            <AnimatePresence>
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 flex flex-col items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl"
                >
                  <p className="text-center text-slate-600 dark:text-slate-400 text-sm font-medium">
                    Scan to view receipt online
                  </p>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code"
                    className="border-8 border-white dark:border-slate-800 rounded-2xl shadow-lg"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
                  >
                    Copy link instead
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Receipt Preview */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl shadow-inner printable-area">
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
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR</span>
              </button>
              
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold transition shadow-lg shadow-indigo-500/30"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>

              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-lg shadow-red-500/30 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Modal */}
        {showEditModal && (
          <ReceiptEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            receipt={receipt}
            onSave={onUpdate}
          />
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { 
            position: absolute; 
            top: 0; 
            left: 0; 
            width: 100%;
            padding: 0 !important;
            background: white !important;
          }
          @page {
            margin: 0;
            size: 80mm auto;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}