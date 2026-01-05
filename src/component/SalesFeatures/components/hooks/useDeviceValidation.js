import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalesService from '../services/SalesService';

export default function useDeviceValidation(products, storeId, setAvailableDeviceIds) {
  const checkSoldDevices = useCallback(async (deviceIds, productId, lineIdx) => {
    if (!deviceIds || deviceIds.length === 0) {
      setAvailableDeviceIds(prev => ({ ...prev, [lineIdx]: { deviceIds: [], deviceSizes: [] } }));
      return;
    }

    try {
      const normalizedIds = deviceIds.map(id => id.trim());
      const available = [];
      const soldIds = [];

      for (const id of normalizedIds) {
        const { sold } = await SalesService.checkDeviceSold(id, storeId);
        if (sold) {
          soldIds.push(id);
        } else {
          available.push(id);
        }
      }

      const product = products.find(p => p.id === productId);
      if (!product) return;

      const availableWithSizes = product.deviceIds
        .map((id, idx) => ({ id, size: product.deviceSizes[idx] || '' }))
        .filter(item => !soldIds.includes(item.id) && available.includes(item.id));

      setAvailableDeviceIds(prev => ({
        ...prev,
        [lineIdx]: {
          deviceIds: availableWithSizes.map(item => item.id),
          deviceSizes: availableWithSizes.map(item => item.size),
        },
      }));
    } catch (error) {
      console.error('Error checking sold devices:', error);
      toast.error('Failed to check sold devices');
      setAvailableDeviceIds(prev => ({ ...prev, [lineIdx]: { deviceIds: [], deviceSizes: [] } }));
    }
  }, [products, storeId, setAvailableDeviceIds]);

  return { checkSoldDevices };
}