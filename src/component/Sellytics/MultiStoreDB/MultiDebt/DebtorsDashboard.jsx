import React, { useState } from 'react';
import useDebtorsDashboard from './useDebtorsDashboard';
import DebtorsSummaryCards from './DebtorsSummaryCards';
import StoreComparisonCards from './StoreComparisonCards';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCurrency } from '../../../context/currencyContext'; // <-- dynamic currency
import CustomerCards from './CustomerCards';
import CustomerDetailsModal from './CustomerDetailsModal';

export default function DebtorsDashboard() {
  const ownerId = Number(localStorage.getItem('owner_id'));
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const {
    stores,
    selectedStore,
    setSelectedStore,
    customerFilter,
    setCustomerFilter,
    productFilter,
    setProductFilter,
    owedFilter,
    setOwedFilter,
    summaryData,
    highestDebtStore,
    customersSummary,
    loading,
    error,
  } = useDebtorsDashboard(ownerId);

  const { formatPrice } = useCurrency(); // <-- dynamic currency from storage
  const [showChart, setShowChart] = useState(true);

  // Chart data
  const chartData = summaryData.map(s => ({
    name: s.storeName,
    Outstanding: s.outstanding,
    Deposited: s.totalDeposited
  }));

  // Export PDF
  const exportPDF = async () => {
    const element = document.getElementById('debt-dashboard-pdf');
    const originalWidth = element.style.width;
    element.style.width = '1200px';
    const canvas = await html2canvas(element, { scale: 3, useCORS: true, scrollX: 0, scrollY: -window.scrollY });
    element.style.width = originalWidth;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save('Debtors_Report.pdf');
  };

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!stores.length) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">No stores found.</div>;

  return (
    <div id="debt-dashboard-pdf" className="max-w-7xl mx-auto px-4 py-6 dark:bg-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6 dark:text-indigo-300">Debtors Dashboard</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <select
          className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          value={selectedStore}
          onChange={e => setSelectedStore(e.target.value)}
        >
          <option value="all">All Stores</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.shop_name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Customer Name"
          className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          value={customerFilter}
          onChange={e => setCustomerFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Product Name"
          className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          value={productFilter}
          onChange={e => setProductFilter(e.target.value)}
        />
        <input
          type="number"
          placeholder={`Min Outstanding (${formatPrice(0).replace(/\d/g, '')})`} // show currency symbol dynamically
          className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          value={owedFilter}
          onChange={e => setOwedFilter(e.target.value)}
        />
      </div>

      {/* Summary Cards */}
      <DebtorsSummaryCards
        summaryData={summaryData}
        highestDebtStore={highestDebtStore}
        formatPrice={formatPrice} // <-- dynamic currency here
      />

      {/* Store Comparison */}
      <StoreComparisonCards
        stores={summaryData}
        compact
        wrapText
        topStore={highestDebtStore}
        formatPrice={formatPrice} // <-- dynamic currency here
      />
<CustomerDetailsModal
  customer={selectedCustomer}
  onClose={() => setSelectedCustomer(null)}
  formatPrice={formatPrice}
/>

<CustomerCards
  customers={customersSummary}
  onSelect={setSelectedCustomer}
  formatPrice={formatPrice}
/>

      {/* Chart */}
      {showChart && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
          <h2 className="text-xl font-semibold mb-2 dark:text-gray-200">Outstanding vs Deposited</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={val => formatPrice(val)} /> {/* dynamic currency */}
              <Bar dataKey="Outstanding" fill="#ff6384" />
              <Bar dataKey="Deposited" fill="#36a2eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Controls */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setShowChart(!showChart)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Toggle Chart
        </button>
        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
