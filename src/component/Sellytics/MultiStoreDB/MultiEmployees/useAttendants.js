import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../supabaseClient";
import { toast } from "react-toastify";

export default function useAttendants(ownerId) {
  const [attendants, setAttendants] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ================= LOAD DATA ================= */
  const loadAttendants = useCallback(async () => {
    setLoading(true);
    try {
      if (!ownerId) throw new Error("No owner ID found.");

      // 1️⃣ Fetch stores (ONLY source of shop_name)
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, shop_name")
        .eq("owner_user_id", ownerId);

      if (storeError) throw storeError;
      setStores(storeData || []);

      if (!storeData?.length) {
        setAttendants([]);
        setError("No stores found for this owner.");
        return;
      }

      const storeMap = Object.fromEntries(
        storeData.map((s) => [s.id, s.shop_name])
      );

      const storeIds = storeData.map((s) => s.id);

      // 2️⃣ Fetch attendants (NO joins, NO store refs)
      const { data: attendantsData, error: attendantsError } = await supabase
        .from("store_users")
        .select(`
          id,
          full_name,
          phone_number,
          email_address,
          role,
          store_id
        `)
        .in("store_id", storeIds)
        .order("id", { ascending: false });

      if (attendantsError) throw attendantsError;

      // 3️⃣ Merge shop_name manually
      setAttendants(
        (attendantsData || []).map((a) => ({
          ...a,
          shop_name: storeMap[a.store_id] || "N/A",
        }))
      );

      setError(null);
    } catch (err) {
      console.error(err);
      setAttendants([]);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    loadAttendants();
  }, [loadAttendants]);

  /* ================= CRUD ================= */

  const createAttendant = async (attendant) => {
    try {
      const { shop_name, ...payload } = attendant; // derived field removed
      const { error } = await supabase
        .from("store_users")
        .insert([payload]);
      if (error) throw error;
      toast.success("Employees created successfully.");
      loadAttendants();
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

  const updateAttendant = async (attendant) => {
    try {
      const { id, shop_name, ...payload } = attendant; // derived field removed
      const { error } = await supabase
        .from("store_users")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
      toast.success("Employees updated successfully.");
      loadAttendants();
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

  const deleteAttendant = async (id) => {
    try {
      const { error } = await supabase
        .from("store_users")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Employees deleted successfully.");
      loadAttendants();
    } catch (err) {
      console.error(err.message);
      toast.error(err.message);
    }
  };

  return {
    attendants,
    stores,
    loading,
    error,
    loadAttendants,
    createAttendant,
    updateAttendant,
    deleteAttendant,
  };
}
