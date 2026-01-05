import { useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalesService from '../services/SalesService';

export default function useDeviceLineHandler({
  storeId,
  products,
  inventory,
  lines,
  setLines,
  checkSoldDevices,
}) {
  const isProcessingClick = useRef(false);

  const handleLineChange = useCallback(async (lineIdx, field, value, deviceIdx = null, isBlur = false) => {
    if (field === 'deviceIds' && deviceIdx !== null) {
      setLines((ls) => {
        const next = [...ls];
        next[lineIdx].deviceIds[deviceIdx] = value;
        if (!value.trim()) {
          next[lineIdx].deviceSizes[deviceIdx] = '';
        }
        return next;
      });

      if (isBlur && value.trim()) {
        const trimmedInput = value.trim();

        // Check if sold
        const { sold, saleRecord } = await SalesService.checkDeviceSold(trimmedInput, storeId);
        if (sold) {
          toast.error(`Product ID "${trimmedInput}" has already been sold`);
          setLines((ls) => {
            const next = [...ls];
            next[lineIdx].deviceIds[deviceIdx] = '';
            next[lineIdx].deviceSizes[deviceIdx] = '';
            return next;
          });
          return;
        }

        // Query product
        const { data: productData, error } = await SalesService.fetchProductByBarcode(trimmedInput, storeId);

        setLines((ls) => {
          const next = [...ls];
          
          if (error || !productData) {
            toast.error(`Product ID "${trimmedInput}" not found`);
            next[lineIdx].deviceIds[deviceIdx] = trimmedInput;
            next[lineIdx].deviceSizes[deviceIdx] = '';
            return next;
          }

          const deviceIds = productData.dynamic_product_imeis
            ? productData.dynamic_product_imeis.split(',').map(id => id.trim()).filter(id => id)
            : [];
          const deviceSizes = productData.device_size
            ? productData.device_size.split(',').map(size => size.trim()).filter(size => size)
            : [];
          const idIndex = deviceIds.indexOf(trimmedInput);

          // Check for existing line with same product
          const existingLineIdx = next.findIndex(line => {
            const product = products.find(p => p.id === line.dynamic_product_id);
            return product && product.name === productData.name;
          });

          const currentLineProduct = next[lineIdx].dynamic_product_id
            ? products.find(p => p.id === next[lineIdx].dynamic_product_id)
            : null;
          const isCurrentLineMatching = currentLineProduct && currentLineProduct.name === productData.name;

          // Duplicate check
          const isDuplicate = next.some(line => 
            line.deviceIds.some(id => id.trim().toLowerCase() === trimmedInput.toLowerCase())
          );

          if (isDuplicate) {
            toast.error(`Product ID "${trimmedInput}" already exists in this sale`);
            next[lineIdx].deviceIds[deviceIdx] = '';
            return next;
          }

          // Append to existing line or update current or create new
          if (existingLineIdx !== -1 && existingLineIdx !== lineIdx) {
            next[existingLineIdx].deviceIds.push(trimmedInput);
            next[existingLineIdx].deviceSizes.push(idIndex !== -1 ? deviceSizes[idIndex] || '' : '');
            if (!next[existingLineIdx].isQuantityManual) {
              next[existingLineIdx].quantity = next[existingLineIdx].deviceIds.filter(id => id.trim()).length || 1;
            }
            next[lineIdx].deviceIds[deviceIdx] = '';
            checkSoldDevices(deviceIds, productData.id, existingLineIdx);
          } else if (isCurrentLineMatching || !next[lineIdx].dynamic_product_id) {
            next[lineIdx].dynamic_product_id = Number(productData.id);
            next[lineIdx].unit_price = Number(productData.selling_price);
            next[lineIdx].deviceIds[deviceIdx] = trimmedInput;
            next[lineIdx].deviceSizes[deviceIdx] = idIndex !== -1 ? deviceSizes[idIndex] || '' : '';
            if (!next[lineIdx].isQuantityManual) {
              next[lineIdx].quantity = next[lineIdx].deviceIds.filter(id => id.trim()).length || 1;
            }
            checkSoldDevices(deviceIds, productData.id, lineIdx);
          } else {
            const newLine = {
              dynamic_product_id: Number(productData.id),
              quantity: 1,
              unit_price: Number(productData.selling_price),
              deviceIds: [trimmedInput],
              deviceSizes: [idIndex !== -1 ? deviceSizes[idIndex] || '' : ''],
              isQuantityManual: false,
            };
            next.push(newLine);
            next[lineIdx].deviceIds[deviceIdx] = '';
            checkSoldDevices(deviceIds, productData.id, next.length - 1);
          }

          return next;
        });
      }
    } else {
      setLines((ls) => {
        const next = [...ls];
        if (field === 'deviceSizes' && deviceIdx !== null) {
          next[lineIdx].deviceSizes[deviceIdx] = value;
        } else if (field === 'quantity') {
          next[lineIdx].quantity = +value;
          next[lineIdx].isQuantityManual = true;
        } else if (field === 'unit_price') {
          next[lineIdx].unit_price = +value;
        } else if (field === 'dynamic_product_id') {
          next[lineIdx].dynamic_product_id = +value;
          const prod = products.find((p) => p.id === +value);
          if (prod) {
            next[lineIdx].unit_price = prod.selling_price;
            checkSoldDevices(prod.deviceIds, prod.id, lineIdx);
            next[lineIdx].deviceIds = [];
            next[lineIdx].deviceSizes = [];
            next[lineIdx].quantity = next[lineIdx].isQuantityManual ? next[lineIdx].quantity : 1;
          }
          const inv = inventory.find((i) => i.dynamic_product_id === +value);
          if (inv && inv.available_qty < 6) {
            const prodName = prod?.name || 'this product';
            toast.warning(`Low stock: only ${inv.available_qty} left for ${prodName}`);
          }
        }
        return next;
      });
    }
  }, [storeId, products, inventory, setLines, checkSoldDevices]);

  const addDeviceId = useCallback((e, lineIdx) => {
    e.preventDefault();
    if (isProcessingClick.current) return;
    isProcessingClick.current = true;
    setTimeout(() => { isProcessingClick.current = false; }, 100);
    setLines(ls => {
      const next = [...ls];
      next[lineIdx].deviceIds = [...next[lineIdx].deviceIds, ''];
      next[lineIdx].deviceSizes = [...next[lineIdx].deviceSizes, ''];
      return next;
    });
  }, [setLines]);

  const removeDeviceId = useCallback((lineIdx, deviceIdx) => {
    setLines(ls => {
      const next = [...ls];
      next[lineIdx].deviceIds = next[lineIdx].deviceIds.filter((_, i) => i !== deviceIdx);
      next[lineIdx].deviceSizes = next[lineIdx].deviceSizes.filter((_, i) => i !== deviceIdx);
      if (next[lineIdx].deviceIds.length === 0) {
        next[lineIdx].deviceIds = [''];
        next[lineIdx].deviceSizes = [''];
      }
      if (!next[lineIdx].isQuantityManual) {
        next[lineIdx].quantity = next[lineIdx].deviceIds.filter(id => id.trim()).length || 1;
      }
      return next;
    });
  }, [setLines]);

  const removeLine = useCallback((idx) => setLines(ls => ls.filter((_, i) => i !== idx)), [setLines]);

  return {
    handleLineChange,
    addDeviceId,
    removeDeviceId,
    removeLine,
    isProcessingClick,
  };
}