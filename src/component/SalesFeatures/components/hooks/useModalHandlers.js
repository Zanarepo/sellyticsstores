import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function useModalHandlers({
  setShowAddModal,
  setShowDetailModal,
  setSelectedDeviceInfo,
  setEditing,
  setSelectedCustomerId,
}) {
  const openDetailModal = useCallback((sale) => {
    const deviceInfo = sale.deviceIds?.map((id, i) => ({
      id: id || '',
      size: sale.deviceSizes?.[i] || '',
    })) || [];
    setSelectedDeviceInfo(deviceInfo);
    setShowDetailModal(true);
  }, [setSelectedDeviceInfo, setShowDetailModal]);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
  }, [setShowDetailModal]);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
  }, [setShowAddModal]);

  const closeEditModal = useCallback(() => {
    setEditing(null);
    setSelectedCustomerId(null);
  }, [setEditing, setSelectedCustomerId]);

  return {
    openDetailModal,
    closeAddModal,
    closeEditModal,
    closeDetailModal,
  };
}