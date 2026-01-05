/**
 * SwiftCheckout - Device Validation Hook
 */
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../supabaseClient';

export default function useDeviceValidation(products, storeId, setAvailableDeviceIds) {
  const checkSoldDevices = useCallback(async (deviceIds, productId, lineIdx) => {
    if (!deviceIds || deviceIds.length === 0) {
      setAvailableDeviceIds(prev => ({ ...prev, [lineIdx]: { deviceIds: [], deviceSizes: [] } }));
      return;
    }

    try {
      const normalizedIds = deviceIds.map(id => id.trim());
      const { data, error } = await supabase
        .from('dynamic_sales')
        .select('device_id')
        .in('device_id', normalizedIds);

      if (error) throw error;

      const soldIds = data.map(item => item.device_id.trim());
      const product = products.find(p => p.id === productId);

      if (!product) return;

      const available = product.deviceIds
        .map((id, idx) => ({ id, size: product.deviceSizes[idx] || '' }))
        .filter(item => !soldIds.includes(item.id));

      setAvailableDeviceIds(prev => ({
        ...prev,
        [lineIdx]: {
          deviceIds: available.map(item => item.id),
          deviceSizes: available.map(item => item.size),
        },
      }));
    } catch (error) {
      console.error('Error fetching sold devices:', error);
      toast.error('Failed to check sold devices');
      setAvailableDeviceIds(prev => ({ ...prev, [lineIdx]: { deviceIds: [], deviceSizes: [] } }));
    }
  }, [products, storeId, setAvailableDeviceIds]);

  return { checkSoldDevices };
}