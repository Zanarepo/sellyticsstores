import React from "react";
import { useStoreInfo } from "../RestockRecommendation/hooks/useStoreInfo";
import { useRestockRecommendations } from "../RestockRecommendation/hooks/useRestockRecommendations";
import { usePagination } from "../../AiInsights/RestockAlert/hooks/usePagination";





import RestockHeader from "./RestockHeader";
import RestockTable from "./RestockTable";
import PaginationControls from "../Anomaly/PaginationControls";

export default function RestockAlerts() {
  const { store, loading: storeLoading, error: storeError } = useStoreInfo();
  const { recommendations, deleteRecommendation, error } = useRestockRecommendations(store?.id);
  const { slice, page, setPage, totalPages } = usePagination(recommendations);

  if (storeError || error) {
    return <p className="text-xs text-red-500">{storeError || error}</p>;
  }
  if (storeLoading) return <p className="text-xs text-gray-500">Loading store info…</p>;

  return (
    <div className="w-full space-y-4">
      <RestockHeader storeName={store?.shop_name} />

      {recommendations.length > 0 ? (
        <>
          <RestockTable recommendations={slice} onDelete={deleteRecommendation} />
          {totalPages > 1 && (
            <PaginationControls page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500 text-center py-6">No restock recommendations available.</p>
      )}
    </div>
  );
}
