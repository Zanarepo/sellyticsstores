import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../../supabaseClient";
import InventorySummaryCard from "./InventorySummaryCard";
import StoreComparisonCards from "./StoreComparisonCards";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InventoryDashboard() {
  const ownerId = Number(localStorage.getItem("owner_id"));
  const [stores, setStores] = useState([]);
  const [inventoryRecords, setInventoryRecords] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch stores
  useEffect(() => {
    if (!ownerId) return;

    const fetchStores = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("stores")
        .select("id, shop_name")
        .eq("owner_user_id", ownerId);
      setStores(data || []);
      setLoading(false);
    };
    fetchStores();
  }, [ownerId]);

  // Fetch inventory records
  useEffect(() => {
    if (!stores.length) return;

    const fetchInventory = async () => {
      const storeIds = stores.map((s) => s.id);
      let query = supabase
        .from("dynamic_inventory")
        .select("store_id, available_qty, quantity_sold, dynamic_product(name)")
        .in("store_id", storeIds);

      if (selectedStoreId !== "all") query = query.eq("store_id", selectedStoreId);

      const { data } = await query;
      setInventoryRecords(data || []);
    };
    fetchInventory();
  }, [stores, selectedStoreId]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return selectedStoreId === "all"
      ? stores
      : stores.filter((s) => s.id === Number(selectedStoreId));
  }, [stores, selectedStoreId]);

  // Metrics computation
  const metrics = useMemo(() => {
    const storeSummary = filteredStores.map((store) => {
      const storeInventory = inventoryRecords.filter((r) => r.store_id === store.id);
      const totalAvailable = storeInventory.reduce((sum, r) => sum + Number(r.available_qty || 0), 0);
      const totalSold = storeInventory.reduce((sum, r) => sum + Number(r.quantity_sold || 0), 0);

      return {
        storeId: store.id,
        storeName: store.shop_name,
        totalAvailable,
        totalSold,
      };
    });

    const topStore = storeSummary.reduce((best, curr) => {
      if (!best || curr.totalAvailable > best.totalAvailable) return curr;
      return best;
    }, null);

    return {
      storeSummary,
      totalAvailable: storeSummary.reduce((sum, s) => sum + s.totalAvailable, 0),
      totalSold: storeSummary.reduce((sum, s) => sum + s.totalSold, 0),
      topStore,
    };
  }, [filteredStores, inventoryRecords]);

  // PDF export
  const exportPDF = async () => {
    const element = document.getElementById("inventory-dashboard-pdf");
    const originalWidth = element.style.width;
    element.style.width = "1200px";

    const canvas = await html2canvas(element, { scale: 3, useCORS: true, scrollX: 0, scrollY: -window.scrollY });
    element.style.width = originalWidth;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("Inventory_Report.pdf");
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (!stores.length) return <div className="p-4">No stores found.</div>;

  return (
    <div id="inventory-dashboard-pdf" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 dark:bg-gray-900 dark:text-white">
      <h1 className="text-xl sm:text-3xl font-bold text-indigo-700 mb-4">Inventory Dashboard</h1>

      {/* Filter & PDF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <select
          className="p-2 border rounded-md text-sm"
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
        >
          <option value="all">All Stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.shop_name}</option>
          ))}
        </select>

        <button
          className="bg-indigo-600 text-white rounded-md text-sm px-3 py-2"
          onClick={exportPDF}
        >
          Download PDF
        </button>
      </div>

      {/* Summary Cards */}
      <InventorySummaryCard metrics={metrics} />

      {/* Store Comparison */}
      <StoreComparisonCards stores={metrics.storeSummary} compact wrapText topStore={metrics.topStore} />

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow mt-4">
        <h2 className="text-sm sm:text-lg font-semibold mb-2">Inventory vs Sold</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={metrics.storeSummary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="storeName" interval={0} tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalAvailable" fill="#4f46e5" />
            <Bar dataKey="totalSold" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
