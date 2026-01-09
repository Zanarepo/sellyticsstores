import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../../supabaseClient";
import { useStores } from "./useStores";
import SalesSummaryCard from "./SalesSummaryCard";
import StoreComparisonCards from "./StoreComparisonCards";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function SalesDashboard() {
  const ownerId = Number(localStorage.getItem("owner_id"));
  const { stores, loading } = useStores(ownerId);

  const [selectedStoreId, setSelectedStoreId] = useState("all");
  const [period, setPeriod] = useState("daily");
  const [salesRecords, setSalesRecords] = useState([]);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* ================= FETCH SALES ================= */
  useEffect(() => {
    if (!stores.length) return;

    const fetchSales = async () => {
      const storeIds = stores.map((s) => s.id);

      const { data } = await supabase
        .from("dynamic_sales")
        .select("store_id, amount, sold_at")
        .in("store_id", storeIds);

      setSalesRecords(data || []);
    };

    fetchSales();
  }, [stores]);

  /* ================= FILTER STORES ================= */
  const filteredStores = useMemo(() => {
    return selectedStoreId === "all"
      ? stores
      : stores.filter((s) => s.id === Number(selectedStoreId));
  }, [stores, selectedStoreId]);

  /* ================= FILTER SALES ================= */
  const filteredSales = useMemo(() => {
    return salesRecords.filter((sale) => {
      const saleDate = new Date(sale.sold_at);
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (period === "daily")
        return saleDate.toDateString() === start.toDateString();

      if (period === "weekly") {
        const week = (d) =>
          Math.ceil(
            ((d - new Date(d.getFullYear(), 0, 1)) / 86400000 +
              new Date(d.getFullYear(), 0, 1).getDay() +
              1) /
              7
          );
        return week(saleDate) === week(start);
      }

      if (period === "monthly")
        return (
          saleDate.getMonth() === start.getMonth() &&
          saleDate.getFullYear() === start.getFullYear()
        );

      if (period === "custom") return saleDate >= start && saleDate <= end;

      return true;
    });
  }, [salesRecords, period, startDate, endDate]);

  /* ================= METRICS ================= */
  const metrics = useMemo(() => {
    const storeSummary = filteredStores.map((store) => {
      const totalSales = filteredSales
        .filter((s) => s.store_id === store.id)
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);

      return {
        storeId: store.id,
        storeName: store.shop_name,
        totalSales,
      };
    });

    return {
      totalRevenue: storeSummary.reduce(
        (sum, s) => sum + s.totalSales,
        0
      ),
      storeSummary,
    };
  }, [filteredStores, filteredSales]);

  /* ================= PDF EXPORT (FIXED) ================= */
  const exportPDF = async () => {
    const element = document.getElementById("dashboard-pdf");

    // Force desktop width for PDF
    const originalWidth = element.style.width;
    element.style.width = "1200px";

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

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

    pdf.save("Sales_Report.pdf");
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (!stores.length) return <div className="p-4">No stores found.</div>;

  /* ================= UI ================= */
  return (
    <div
      id="dashboard-pdf"
      className="max-w-7xl mx-auto px-3 sm:px-6 py-4 dark:bg-gray-900 dark:text-white"
    >
      <h1 className="text-xl sm:text-3xl font-bold text-indigo-700 mb-4">
        Sales Dashboard
      </h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <select
          className="p-2 border rounded-md text-sm"
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
        >
          <option value="all">All Stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.shop_name}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded-md text-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </select>

        {period === "custom" && (
          <>
            <input
              type="date"
              className="p-2 border rounded-md text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="p-2 border rounded-md text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        )}

        <button
          onClick={exportPDF}
          className="bg-indigo-600 text-white rounded-md text-sm px-3 py-2"
        >
          Download PDF
        </button>
      </div>

      {/* SUMMARY */}
      <SalesSummaryCard metrics={metrics} compact />

      {/* STORE LIST */}
      <StoreComparisonCards
        stores={metrics.storeSummary}
        compact
        wrapText
      />

      {/* CHART */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow mt-4">
        <h2 className="text-sm sm:text-lg font-semibold mb-2">
          Store Revenue Comparison
        </h2>

        <div className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metrics.storeSummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="storeName"
                interval={0}
                tick={{ fontSize: 10 }}
                angle={-25}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSales" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
