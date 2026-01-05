// src/components/Anomalies/AnomalyAlerts.jsx
import { useStoreInfo } from '../Anomaly/hooks/useStoreInfo';
import { useAnomalies } from '../Anomaly/hooks/useAnomalies';
import { usePagination } from '../Anomaly/hooks/usePagination';
import { supabase } from '../../../../supabaseClient';
import { toast } from 'react-hot-toast';

import AnomalyHeader from './AnomalyHeader';
import AnomalyLegend from './AnomalyLegend';
import AnomalyTable from './AnomalyTable';
import PaginationControls from './PaginationControls';

export default function AnomalyAlerts() {
  const { store, loading: storeLoading, error } = useStoreInfo();
  const anomalies = useAnomalies(store?.id);
  const { slice, page, setPage, totalPages, refresh } = usePagination(anomalies);

  const handleDelete = async (anomaly) => {
    if (!anomaly) return;
    if (!window.confirm('Delete this anomaly?')) return;

    const { error } = await supabase
      .from('anomalies')
      .delete()
      .eq('id', anomaly.id);

    if (error) {
      toast.error('Failed to delete anomaly');
      console.error(error);
    } else {
      toast.success('Anomaly deleted successfully');
      refresh(); // refresh pagination & anomalies
    }
  };

  if (error) {
    return (
      <p className="text-xs text-red-500">
        {error}
      </p>
    );
  }

  if (storeLoading) {
    return (
      <p className="text-xs text-gray-500">
        Loading store information…
      </p>
    );
  }

  return (
    <div className="w-full space-y-4">
      <AnomalyHeader storeName={store?.shop_name || 'Store'} />

      <AnomalyLegend />

      {anomalies.length > 0 ? (
        <>
          <AnomalyTable anomalies={slice} onDelete={handleDelete} />

          {totalPages > 1 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500 text-center py-6">
          No anomalies detected for this store.
        </p>
      )}
    </div>
  );
}
