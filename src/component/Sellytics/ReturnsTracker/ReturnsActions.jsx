// src/components/returns-management/ReturnsActions.jsx
import React from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/currencyContext';

export default function ReturnsActions({ 
  selectedIds = [],        // ← Default to empty array
  onDeleteMultiple, 
  filteredReturns = []     // ← Also protect this
}) {
  const { formatPrice } = useCurrency();

  const hasSelection = Array.isArray(selectedIds) && selectedIds.length > 0;

  const handleExport = () => {
    const data = hasSelection
      ? filteredReturns.filter(r => selectedIds.includes(r.id))
      : filteredReturns;

    if (!data || data.length === 0) {
      return toast.error('No returns to export');
    }

    const csv = [
      ['Receipt Code', 'Customer Address', 'Product', 'Device ID', 'Qty', 'Amount', 'Remark', 'Status', 'Returned Date'],
      ...data.map(r => [
        r.receipt_code || '',
        r.customer_address || '',
        r.product_name || '',
        r.device_id || '',
        r.qty || 0,
        r.amount || 0,
        r.remark || '',
        r.status || '',
        r.returned_date || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `returns_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully');
  };

  const handleReport = () => {
    const data = hasSelection
      ? filteredReturns.filter(r => selectedIds.includes(r.id))
      : filteredReturns;

    if (!data || data.length === 0) {
      return toast.error('No returns for report');
    }

    const totalValue = data.reduce((sum, r) => sum + (r.amount || 0), 0);

    const report = `
RETURNS REPORT
Date: ${new Date().toLocaleDateString()}
Returns: ${data.length} | Total Value: ${formatPrice(totalValue)}

${data.map((r, idx) => `${idx + 1}. ${r.product_name || 'Unknown'} - ${r.receipt_code || 'N/A'} - ${formatPrice(r.amount || 0)} - ${r.remark || 'No remark'}`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `returns_report_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report generated successfully');
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExport}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all hover:shadow-lg"
      >
        <Download className="w-4 h-4" />
        Export {hasSelection && `(${selectedIds.length})`}
      </button>

      <button
        onClick={handleReport}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:shadow-lg"
      >
        <FileText className="w-4 h-4" />
        Generate Report
      </button>

      {hasSelection && (
        <button
          onClick={() => onDeleteMultiple(selectedIds)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all hover:shadow-lg"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected ({selectedIds.length})
        </button>
      )}
    </div>
  );
}