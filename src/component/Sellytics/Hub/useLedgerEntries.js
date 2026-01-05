import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

/**
 * Custom hook for managing ledger entries with real-time delete
 */
export function useLedgerEntries(initialEntries, loading) {
  const [entries, setEntries] = useState(initialEntries);

  // Sync local state when parent data changes
  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const deleteEntry = async (entryId) => {
    const confirmed = window.confirm(
      "Delete this transaction? This cannot be undone."
    );
    if (!confirmed) return;

    // Optimistic update
    setEntries((prev) => prev.filter((e) => e.id !== entryId));

    const { error } = await supabase
      .from("warehouse_ledger")
      .delete()
      .eq("id", entryId);

    if (error) {
      toast.error("Failed to delete transaction");
      setEntries(initialEntries); // revert
    } else {
      toast.success("Transaction deleted");
    }
  };

  const clearAll = async () => {
    const confirmed = window.confirm(
      "Delete ALL transactions? This action is permanent!"
    );
    if (!confirmed) return;

    setEntries([]);
    const { error } = await supabase
      .from("warehouse_ledger")
      .delete()
      .in("id", initialEntries.map((e) => e.id));

    if (error) {
      toast.error("Failed to clear history");
      setEntries(initialEntries);
    } else {
      toast.success("All transactions cleared");
    }
  };

  return { entries, setEntries, deleteEntry, clearAll, loading };
}
