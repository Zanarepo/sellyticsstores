/**
 * SwiftCheckout - Modal Handlers Hook
 */
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function useModalHandlers({
  setShowAddModal,
  setShowDetailModal,
  setSelectedDeviceInfo,
  setEditing,
  setSelectedCustomerId,
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openDetailModal = useCallback((sale) => {
    const deviceInfo = sale.deviceIds?.map((id, i) => ({
      id: id || '',
      size: sale.deviceSizes?.[i] || '',
    })) || [];
    setSelectedDeviceInfo(deviceInfo);
    setSelectedProduct(sale);
    setShowDetailModal(true);
  }, [setSelectedDeviceInfo, setShowDetailModal]);

  const closeDetailModal = useCallback(() => {
    setSelectedProduct(null);
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
    selectedProduct,
  };
}