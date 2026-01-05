

import { supabase } from '../../../../supabaseClient';
import { useStoreInfo } from "../RestockAlert/hooks/useStoreInfo";
import { useRestockForecasts } from "../RestockAlert/hooks/useRestockForecasts";
import { usePagination } from "../RestockAlert/hooks/usePagination";


import RestockHeader from "./RestockHeader";
import RestockLegend from "./RestockLegend";
import RestockTable from "./RestockTable";
import PaginationControls from "./PaginationControls";

export default function RestockAlerts() {
  const { store, loading: storeLoading, error } = useStoreInfo();
  const [forecasts, setForecasts] = useRestockForecasts(store?.id);
  const { slice, page, setPage, totalPages, refresh } = usePagination(forecasts);

  // Delete handler
  const handleDelete = async (forecast) => {
    if (!forecast?.id) return;
    try {
      const { error } = await supabase
        .from("forecasts")
        .delete()
        .eq("id", forecast.id);
      if (error) throw error;

      setForecasts((prev) => prev.filter(f => f.id !== forecast.id));
      refresh(); // adjust pagination if needed
    } catch (err) {
      console.error("Delete forecast failed:", err.message);
    }
  };

  if (error) return <p className="text-xs text-red-500">{error}</p>;
  if (storeLoading) return <p className="text-xs text-gray-500">Loading store info…</p>;

  return (
    <div className="w-full space-y-4">
      <RestockHeader storeName={store?.shop_name || "Store"} />
      <RestockLegend />

      {forecasts.length ? (
        <>
          <RestockTable forecasts={slice} onDelete={handleDelete} />
          {totalPages > 1 && (
            <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500 text-center py-6">
          No restocking recommendations for this store.
        </p>
      )}
    </div>
  );
}
