import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useScanner from './useScanner';
import SalesService from '../services/SalesService';

export default function useScanHandler(storeId, setLines, setSaleForm) {
  const handleScanSuccess = useCallback(async (scannedId, target) => {
    try {
      const { data: productData, error } = await SalesService.fetchProductByBarcode(scannedId, storeId);

      if (error || !productData) {
        return { success: false, error: `Product ID "${scannedId}" not found` };
      }

      const { modal, lineIdx, deviceIdx } = target;

      if (modal === 'add') {
        setLines(ls => {
          const next = [...ls];
          next[lineIdx].dynamic_product_id = productData.id;
          next[lineIdx].unit_price = productData.selling_price;
          next[lineIdx].deviceIds[deviceIdx] = scannedId;
          if (!next[lineIdx].isQuantityManual) {
            next[lineIdx].quantity = next[lineIdx].deviceIds.filter(id => id.trim()).length || 1;
          }
          return next;
        });
      } else if (modal === 'edit') {
        setSaleForm(f => ({
          ...f,
          dynamic_product_id: productData.id,
          unit_price: productData.selling_price,
          deviceIds: f.deviceIds.map((id, i) => i === deviceIdx ? scannedId : id),
        }));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [storeId, setLines, setSaleForm]);

  const scanner = useScanner(handleScanSuccess);

  return { scanner };
}