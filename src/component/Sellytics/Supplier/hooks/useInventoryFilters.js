// hooks/useSuppliersInventory.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function useSuppliersInventory(filters, page, limit) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const storeId = localStorage.getItem("store_id");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("suppliers_inventory")
        .select("*", { count: "exact" })
        .eq("store_id", storeId);

      if (filters.search) {
        query = query.ilike("device_name", `%${filters.search}%`);
      }

      const { data: result, count, error } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      setData(result || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Suppliers fetch error:", err.message);
      setData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit, storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateItem = async (id, newData) => {
    try {
      const { error } = await supabase
        .from("suppliers_inventory")
        .update(newData)
        .eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Update supplier error:", err.message);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      const { error } = await supabase
        .from("suppliers_inventory")
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Delete supplier error:", err.message);
    }
  };

  return { data, loading, totalCount, updateItem, deleteItem };
}
