/**
 * Returns Report Generator Component - Fixed Currency Formatting
 */
import React from 'react';
import { Download, FileText } from 'lucide-react';
import { useCurrency } from '../../context/currencyContext';
import toast from 'react-hot-toast';

export default function ReportGenerator({ returns, storeName }) {
  const { formatPrice } = useCurrency();

  const generateCSV = () => {
    if (returns.length === 0) {
      toast.error('No returns to export');
      return;
    }

    const toastId = toast.loading('Generating CSV...');

    try {
      const headers = [
        'Receipt ID',
        'Product Name',
        'Device ID',
        'Customer Address',
        'Quantity',
        'Amount',
        'Status',
        'Reason',
        'Return Date',
        'Created At'
      ];

      const rows = returns.map(ret => [
        ret.receipt_code || '',
        ret.product_name || '',
        ret.device_id || '',
        ret.customer_address || '',
        ret.qty || 0,
        formatPrice(ret.amount || 0), // Use formatPrice consistently
        ret.status || '',
        ret.remark || '',
        ret.returned_date || '',
        ret.created_at ? new Date(ret.created_at).toLocaleString() : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `returns_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV downloaded', { id: toastId, icon: '📥' });
    } catch (err) {
      console.error('Failed to generate CSV:', err);
      toast.error('Failed to generate CSV', { id: toastId });
    }
  };

  const generatePDF = () => {
    if (returns.length === 0) {
      toast.error('No returns to export');
      return;
    }

    const toastId = toast.loading('Generating PDF...');

    try {
      // Calculate totals using raw numbers
      const totalReturns = returns.length;
      const totalValue = returns.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const averageValue = totalReturns > 0 ? totalValue / totalReturns : 0;

      // Status breakdown
      const statusBreakdown = {};
      returns.forEach(r => {
        const status = r.status || 'Unknown';
        statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      });

      const statusSummary = Object.entries(statusBreakdown)
        .map(([status, count]) => `<strong>${status}:</strong> ${count}`)
        .join(' | ');

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Returns Report - ${storeName || 'Store'}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { margin: 0; color: #1e293b; font-size: 28px; }
            .header p { color: #64748b; margin: 8px 0; font-size: 14px; }
            .summary { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-item .label { font-size: 13px; color: #64748b; margin-bottom: 8px; }
            .summary-item .value { font-size: 28px; font-weight: bold; color: #1e293b; }
            .status-breakdown { margin: 20px 0; font-size: 14px; color: #475569; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; }
            th { background: #4f46e5; color: white; padding: 14px 12px; text-align: left; font-size: 13px; }
            th:first-child { border-top-left-radius: 8px; }
            th:last-child { border-top-right-radius: 8px; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            tr:nth-child(even) { background: #f9fafb; }
            .status { padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-approved { background: #d1fae5; color: #065f46; }
            .status-rejected { background: #fee2e2; color: #991b1b; }
            .status-refunded { background: #dbeafe; color: #1e40af; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Returns Report</h1>
            <p><strong>${storeName || 'Store'}</strong></p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>

          <div class="summary">
            <h3 style="margin: 0 0 20px 0; color: #1e293b;">Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="label">Total Returns</div>
                <div class="value">${totalReturns}</div>
              </div>
              <div class="summary-item">
                <div class="label">Total Value</div>
                <div class="value">${formatPrice(totalValue)}</div>
              </div>
              <div class="summary-item">
                <div class="label">Average Value</div>
                <div class="value">${formatPrice(averageValue)}</div>
              </div>
            </div>
          </div>

          <div class="status-breakdown">
            ${statusSummary}
          </div>

          <table>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Product</th>
                <th>Device ID</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Return Date</th>
              </tr>
            </thead>
            <tbody>
              ${returns.map(ret => `
                <tr>
                  <td>${ret.receipt_code || 'N/A'}</td>
                  <td>${ret.product_name || ''}</td>
                  <td>${ret.device_id || 'N/A'}</td>
                  <td>${ret.qty || 0}</td>
                  <td>${formatPrice(ret.amount || 0)}</td>
                  <td><span class="status status-${(ret.status || 'pending').toLowerCase()}">${ret.status || ''}</span></td>
                  <td>${ret.returned_date ? new Date(ret.returned_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report was automatically generated by the Returns Management System</p>
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

      toast.success('PDF opened — use browser print dialog to save', { id: toastId, icon: '🖨️' });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={generateCSV}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden">CSV</span>
      </button>
      <button
        onClick={generatePDF}
        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm shadow-sm"
      >
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Print PDF</span>
        <span className="sm:hidden">PDF</span>
      </button>
    </div>
  );
}