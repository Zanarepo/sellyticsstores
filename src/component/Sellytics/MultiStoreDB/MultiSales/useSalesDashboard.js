import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../../supabaseClient";
import { useStores } from "./useStores";

export function useSalesDashboard(ownerId) {
  const { stores, loading: storesLoading } = useStores(ownerId);

  const [selectedStoreId, setSelectedStoreId] = useState("all");
  const [period, setPeriod] = useState("daily"); // daily | weekly | monthly | custom
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [salesRecords, setSalesRecords] = useState([]);

  // Fetch sales when stores are available
  useEffect(() => {
    if (!stores.length) return;

    const fetchSales = async () => {
      const storeIds = stores.map((s) => s.id);
      const { data, error } = await supabase
        .from("dynamic_sales")
        .select("store_id, amount, sold_at")
        .in("store_id", storeIds);

      if (!error) setSalesRecords(data || []);
    };

    fetchSales();
  }, [stores]);

  // Filter stores based on selection
  const filteredStores = useMemo(
    () =>
      selectedStoreId === "all"
        ? stores
        : stores.filter((s) => s.id === Number(selectedStoreId)),
    [stores, selectedStoreId]
  );

  // Filter sales based on period
  const filteredSales = useMemo(() => {
    return salesRecords.filter((sale) => {
      const saleDate = new Date(sale.sold_at);
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (period === "daily") {
        return saleDate.toDateString() === start.toDateString();
      } else if (period === "weekly") {
        const weekOfYear = (d) =>
          Math.ceil(
            ((d - new Date(d.getFullYear(), 0, 1)) / 86400000 +
              new Date(d.getFullYear(), 0, 1).getDay() +
              1) /
              7
          );
        return (
          weekOfYear(saleDate) === weekOfYear(start) &&
          saleDate.getFullYear() === start.getFullYear()
        );
      } else if (period === "monthly") {
        return (
          saleDate.getMonth() === start.getMonth() &&
          saleDate.getFullYear() === start.getFullYear()
        );
      } else if (period === "custom") {
        return saleDate >= start && saleDate <= end;
      }

      return true;
    });
  }, [salesRecords, period, startDate, endDate]);

  // Compute metrics
  const metrics = useMemo(() => {
    const storeSummary = filteredStores.map((store) => {
      const totalSales = filteredSales
        .filter((s) => s.store_id === store.id)
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);

      return {
        ...store,
        totalSales,
        storeName: store.shop_name,
      };
    });

    const totalRevenue = storeSummary.reduce((sum, s) => sum + s.totalSales, 0);

    return { totalRevenue, storeSummary };
  }, [filteredStores, filteredSales]);

  return {
    stores,
    loading: storesLoading,
    selectedStoreId,
    setSelectedStoreId,
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    metrics,
  };
}
