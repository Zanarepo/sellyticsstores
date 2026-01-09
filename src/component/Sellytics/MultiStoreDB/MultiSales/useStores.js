import { useEffect, useState } from "react";
import { supabase } from "../../../../supabaseClient";

export function useStores(ownerId) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) return;

    supabase
      .from("stores")
      .select("id, shop_name")
      .eq("owner_user_id", ownerId)
      .then(({ data, error }) => {
        setStores(data || []);
        setLoading(false);
      });
  }, [ownerId]);

  return { stores, loading };
}
