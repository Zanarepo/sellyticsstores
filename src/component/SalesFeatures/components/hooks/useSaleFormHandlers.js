import { useCallback } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function useSaleFormHandlers({
  saleForm,
  setSaleForm,
  products,
  setSelectedCustomerId,
}) {
  const handleEditChange = useCallback((field, value, deviceIdx = null) => {
    setSaleForm(f => {
      const next = { ...f };
      if (field === 'deviceIds' && deviceIdx !== null) {
        next.deviceIds[deviceIdx] = value;
      } else if (field === 'quantity') {
        next.quantity = +value;
        next.isQuantityManual = true;
      } else if (field === 'dynamic_product_id') {
        next.dynamic_product_id = +value;
        const prod = products.find(p => p.id === +value);
        if (prod) next.unit_price = prod.selling_price;
      } else {
        next[field] = ['unit_price', 'customer_id'].includes(field) ? +value : value;
      }
      return next;
    });
  }, [setSaleForm, products]);

  const addEditDeviceId = useCallback((e) => {
    e?.preventDefault();
    setSaleForm(f => ({
      ...f,
      deviceIds: [...f.deviceIds, ''],
      deviceSizes: [...f.deviceSizes, ''],
    }));
  }, [setSaleForm]);

  const removeEditDeviceId = useCallback((deviceIdx) => {
    setSaleForm(f => ({
      ...f,
      deviceIds: f.deviceIds.filter((_, i) => i !== deviceIdx),
      deviceSizes: f.deviceSizes.filter((_, i) => i !== deviceIdx),
    }));
  }, [setSaleForm]);

  const handleEdit = useCallback((sale) => {
    setSaleForm({
      dynamic_product_id: sale.dynamic_product_id,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      deviceIds: sale.deviceIds?.length > 0 ? sale.deviceIds : [''],
      deviceSizes: sale.deviceSizes?.length > 0 ? sale.deviceSizes : [''],
      payment_method: sale.payment_method,
      customer_id: sale.customer_id,
      isQuantityManual: false,
    });
    setSelectedCustomerId(sale.customer_id);
  }, [setSaleForm, setSelectedCustomerId]);

  return {
    handleEditChange,
    addEditDeviceId,
    removeEditDeviceId,
    handleEdit,
  };
}