/**
 * SwiftCheckout - Scan Handler Hook
 */
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../../../supabaseClient';
import useScanner from './useScanner';

export default function useScanHandler(storeId, setLines, setSaleForm) {
  const handleScanSuccess = useCallback(async (scannedId, target) => {
    try {
      const { data: productData, error } = await supabase
        .from('dynamic_product')
        .select('*')
        .eq('store_id', storeId)
        .contains('dynamic_product_imeis', [scannedId]);

      if (error || !productData?.length) {
        return { success: false, error: `Product ID "${scannedId}" not found` };
      }

      const product = productData[0];
      const { modal, lineIdx, deviceIdx } = target;

      if (modal === 'add') {
        setLines(ls => {
          const next = [...ls];
          next[lineIdx].dynamic_product_id = product.id;
          next[lineIdx].unit_price = product.selling_price;
          next[lineIdx].deviceIds[deviceIdx] = scannedId;
          if (!next[lineIdx].isQuantityManual) {
            next[lineIdx].quantity = next[lineIdx].deviceIds.filter(id => id.trim()).length || 1;
          }
          return next;
        });
      } else if (modal === 'edit') {
        setSaleForm(f => ({
          ...f,
          dynamic_product_id: product.id,
          unit_price: product.selling_price,
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