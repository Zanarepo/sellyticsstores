/**
 * SwiftCheckout - Export Buttons Component
 */
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import CustomDropdown, { DropdownItem } from '../SwiftCheckout/CustomDropdown';

export default function ExportButtons({
  viewMode,
  filtered,
  totalsData,
  formatPrice,
}) {
  const exportToCSV = () => {
    let csvContent = '';
    
    if (viewMode === 'list') {
      csvContent = 'Product,Customer,Quantity,Amount,Payment Method,Device IDs,Date\n';
      filtered.forEach(sale => {
        csvContent += `"${sale.product_name || ''}","${sale.customer_name || ''}",${sale.quantity},"${formatPrice(sale.amount)}","${sale.payment_method || ''}","${sale.deviceIds?.join('; ') || ''}","${sale.sold_at || ''}"\n`;
      });
    } else {
      csvContent = 'Period,Total Revenue,Sales Count\n';
      totalsData.forEach(t => {
        csvContent += `"${t.period}","${formatPrice(t.total)}",${t.count}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Exported to CSV');
  };

  const exportToJSON = () => {
    const data = viewMode === 'list' ? filtered : totalsData;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_${viewMode}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Exported to JSON');
  };

  const dataLength = viewMode === 'list' ? filtered.length : totalsData.length;
  
  if (dataLength === 0) return null;

  return (
    <div className="flex justify-end">
      <CustomDropdown
        trigger={
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        }
      >
        <DropdownItem icon={FileSpreadsheet} onClick={exportToCSV}>
          Export as CSV
        </DropdownItem>
        <DropdownItem icon={FileText} onClick={exportToJSON}>
          Export as JSON
        </DropdownItem>
      </CustomDropdown>
    </div>
  );
}