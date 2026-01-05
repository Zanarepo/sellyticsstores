// components/inventory-valuation/InventoryActions.jsx
import React from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';
import toast from 'react-hot-toast';

export default function InventoryActions({
  selectedIds,
  onDeleteMultiple,
  filteredInventory,
  storeName = 'Inventory Valuation', // Optional: pass your store/company name
}) {
  const { formatPrice } = useCurrency();

  // Get data: selected items or all filtered
  const getData = () => {
    return selectedIds.length > 0
      ? filteredInventory.filter(i => selectedIds.includes(i.id))
      : filteredInventory;
  };

  const generateCSV = () => {
    const data = getData();
    if (data.length === 0) {
      toast.error('No items to export');
      return;
    }

    const toastId = toast.loading('Generating CSV...');

    try {
      const headers = ['Product', 'Quantity', 'Purchase Price', 'Total Value'];

      const rows = data.map(item => [
        item.product_name || '',
        item.quantity || 0,
        formatPrice(item.purchase_price || 0),
        formatPrice((item.quantity || 0) * (item.purchase_price || 0)),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_valuation_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('CSV exported successfully', { id: toastId, icon: '📥' });
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error('Failed to export CSV', { id: toastId });
    }
  };

  const generatePDF = () => {
    const data = getData();
    if (data.length === 0) {
      toast.error('No items to generate report');
      return;
    }

    const toastId = toast.loading('Generating PDF report...');

    try {
      const totalItems = data.length;
      const pricedItems = data.filter(i => i.purchase_price && i.purchase_price > 0);
      const missingPriceItems = totalItems - pricedItems.length;
      const totalValue = data.reduce(
        (sum, i) => sum + (i.quantity || 0) * (i.purchase_price || 0),
        0
      );
      const averagePrice = pricedItems.length > 0
        ? totalValue / pricedItems.reduce((s, i) => s + (i.quantity || 0), 0)
        : 0;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Inventory Valuation Report - ${storeName}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { margin: 0; font-size: 28px; color: #1e293b; }
            .header p { margin: 8px 0; font-size: 14px; color: #64748b; }
            .summary { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-item .label { font-size: 13px; color: #64748b; margin-bottom: 8px; }
            .summary-item .value { font-size: 28px; font-weight: bold; color: #1e293b; }
            .status-info { margin: 25px 0; font-size: 14px; color: #475569; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; }
            th { background: #4f46e5; color: white; padding: 14px 12px; text-align: left; font-size: 13px; }
            th:first-child { border-top-left-radius: 8px; }
            th:last-child { border-top-right-radius: 8px; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            tr:nth-child(even) { background: #f9fafb; }
            .text-right { text-align: right; }
            .status-priced { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
            .status-missing { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inventory Valuation Report</h1>
            <p><strong>${storeName}</strong></p>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>${totalItems} item${totalItems !== 1 ? 's' : ''} in inventory</p>
          </div>

          <div class="summary">
            <h3 style="margin: 0 0 20px 0; color: #1e293b;">Valuation Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="label">Total Items</div>
                <div class="value">${totalItems}</div>
              </div>
              <div class="summary-item">
                <div class="label">Priced Items</div>
                <div class="value" style="color: #16a34a;">${pricedItems.length}</div>
              </div>
              <div class="summary-item">
                <div class="label">Missing Price</div>
                <div class="value" style="color: #dc2626;">${missingPriceItems}</div>
              </div>
              <div class="summary-item">
                <div class="label">Total Value</div>
                <div class="value" style="color: #4f46e5;">${formatPrice(totalValue)}</div>
              </div>
            </div>
          </div>

          ${averagePrice > 0 ? `
          <div class="status-info">
            <strong>Average Unit Price (priced items):</strong> ${formatPrice(averagePrice)}
          </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Purchase Price</th>
                <th class="text-right">Total Value</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(item => {
                const hasPrice = item.purchase_price && item.purchase_price > 0;
                const total = (item.quantity || 0) * (item.purchase_price || 0);
                return `
                <tr>
                  <td>${item.product_name || 'Unnamed Product'}</td>
                  <td class="text-right">${item.quantity || 0}</td>
                  <td class="text-right">${hasPrice ? formatPrice(item.purchase_price) : '—'}</td>
                  <td class="text-right" style="font-weight: 600; color: ${hasPrice ? '#4f46e5' : '#991b1b'};">
                    ${hasPrice ? formatPrice(total) : '—'}
                  </td>
                  <td class="text-center">
                    <span class="${hasPrice ? 'status-priced' : 'status-missing'}">
                      ${hasPrice ? 'Priced' : 'Missing'}
                    </span>
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This inventory valuation report was automatically generated by the Inventory Management System</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Popup blocked. Please allow popups to generate PDF.', { id: toastId });
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      toast.success('PDF report ready — use print dialog to save as PDF', {
        id: toastId,
        icon: '🖨️',
        duration: 5000,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF report', { id: toastId });
    }
  };

  const dataCount = selectedIds.length > 0 ? selectedIds.length : filteredInventory.length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={generateCSV}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden">CSV</span>
        {dataCount > 0 && <span className="ml-1">({dataCount})</span>}
      </button>

      <button
        onClick={generatePDF}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Print PDF Report</span>
        <span className="sm:hidden">PDF</span>
      </button>

      {selectedIds.length > 0 && (
        <button
          onClick={() => onDeleteMultiple(selectedIds)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected ({selectedIds.length})
        </button>
      )}
    </div>
  );
}