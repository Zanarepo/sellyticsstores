/**
 * LedgerActions Component - Optimized with PDF Report & CSV Export
 * Matches ReportGenerator style with professional printable PDF
 */
import React from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { useCurrency } from '../../../context/currencyContext';
import toast from 'react-hot-toast';

export default function LedgerActions({
  selectedEntries,
  onDeleteMultiple,
  filteredEntries,
  storeName = 'Business Ledger', // Optional: pass store/company name
}) {
  const { formatPrice } = useCurrency();

  // Determine which data to use: selected or all filtered
  const getData = () => {
    return selectedEntries.length > 0
      ? filteredEntries.filter(e => selectedEntries.includes(e.id))
      : filteredEntries;
  };

  const generateCSV = () => {
    const data = getData();
    if (data.length === 0) {
      toast.error('No entries to export');
      return;
    }

    const toastId = toast.loading('Generating CSV...');

    try {
      const headers = ['Date', 'Account Type', 'Description', 'Debit', 'Credit'];

      const rows = data.map(entry => [
        new Date(entry.transaction_date).toLocaleDateString(),
        entry.account || '',
        entry.description || '',
        formatPrice(entry.debit || 0),
        formatPrice(entry.credit || 0),
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
      link.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV exported successfully', { id: toastId, icon: '📥' });
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error('Failed to export CSV', { id: toastId });
    }
  };

  const generatePDF = () => {
    const data = getData();
    if (data.length === 0) {
      toast.error('No entries to generate report');
      return;
    }

    const toastId = toast.loading('Generating PDF report...');

    try {
      const totalDebit = data.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
      const totalCredit = data.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
      const netBalance = totalDebit - totalCredit;

      const accountBreakdown = {};
      data.forEach(entry => {
        const account = entry.account || 'Uncategorized';
        accountBreakdown[account] = (accountBreakdown[account] || 0) + (entry.debit || 0) - (entry.credit || 0);
      });

      const accountSummary = Object.entries(accountBreakdown)
        .map(([account, balance]) => `<strong>${account}:</strong> ${formatPrice(balance)}`)
        .join(' | ');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Ledger Report - ${storeName}</title>
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
            .account-breakdown { margin: 25px 0; font-size: 14px; color: #475569; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; }
            th { background: #4f46e5; color: white; padding: 14px 12px; text-align: left; font-size: 13px; }
            th:first-child { border-top-left-radius: 8px; }
            th:last-child { border-top-right-radius: 8px; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
            tr:nth-child(even) { background: #f9fafb; }
            .amount-debit { color: #dc2626; font-weight: 600; }
            .amount-credit { color: #16a34a; font-weight: 600; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>General Ledger Report</h1>
            <p><strong>${storeName}</strong></p>
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>${data.length} transaction${data.length !== 1 ? 's' : ''}</p>
          </div>

          <div class="summary">
            <h3 style="margin: 0 0 20px 0; color: #1e293b;">Financial Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="label">Total Debits</div>
                <div class="value amount-debit">${formatPrice(totalDebit)}</div>
              </div>
              <div class="summary-item">
                <div class="label">Total Credits</div>
                <div class="value amount-credit">${formatPrice(totalCredit)}</div>
              </div>
              <div class="summary-item">
                <div class="label">Net Balance</div>
                <div class="value" style="color: ${netBalance >= 0 ? '#16a34a' : '#dc2626'};">
                  ${formatPrice(netBalance)}
                </div>
              </div>
            </div>
          </div>

          ${accountSummary ? `
          <div class="account-breakdown">
            <strong>Account Balances:</strong> ${accountSummary}
          </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Description</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(entry => `
                <tr>
                  <td>${new Date(entry.transaction_date).toLocaleDateString()}</td>
                  <td>${entry.account || 'N/A'}</td>
                  <td>${entry.description || '-'}</td>
                  <td class="text-right ${entry.debit ? 'amount-debit' : ''}">${formatPrice(entry.debit || 0)}</td>
                  <td class="text-right ${entry.credit ? 'amount-credit' : ''}">${formatPrice(entry.credit || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This ledger report was automatically generated by the Financial Management System</p>
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

  const dataCount = selectedEntries.length > 0 ? selectedEntries.length : filteredEntries.length;

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

      {selectedEntries.length > 0 && (
        <button
          onClick={() => onDeleteMultiple(selectedEntries)}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected ({selectedEntries.length})
        </button>
      )}
    </div>
  );
}