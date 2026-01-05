// components/ProductItemForm.jsx
import React from 'react';
import { Trash2, Plus, Camera } from 'lucide-react';

export default function ProductItemForm({
  product,
  productIndex,
  productsLength,
  setProducts,
  onOpenScanner,
  onRemoveProduct,
}) {
  const updateField = (field, value) => {
  updateProduct(p => ({ ...p, [field]: value }));
};

  const updateProduct = (updater) => {
  setProducts(prev => {
    const next = [...prev];
    next[productIndex] = updater(prev[productIndex]);
    return next;
  });
};



const toggleUnique = (checked) => {
  updateProduct(p => {
    if (checked) {
      return {
        ...p,
        is_unique: true,
        deviceIds: p.device_id ? [p.device_id, ''] : [''],
        deviceSizes: p.device_size ? [p.device_size, ''] : [''],
        device_id: '',
        device_size: '',
      };
    }

    return {
      ...p,
      is_unique: false,
      device_id: p.deviceIds?.[0] || '',
      device_size: p.deviceSizes?.[0] || '',
      purchase_qty: String(p.deviceIds?.filter(Boolean).length || 1),
      deviceIds: [''],
      deviceSizes: [''],
    };
  });
};
const updateDeviceId = (deviceIndex, value) => {
  updateProduct(p => ({
    ...p,
    deviceIds: p.deviceIds.map((id, i) =>
      i === deviceIndex ? value : id
    ),
  }));
};

const updateDeviceSize = (deviceIndex, value) => {
  updateProduct(p => ({
    ...p,
    deviceSizes: p.deviceSizes.map((s, i) =>
      i === deviceIndex ? value : s
    ),
  }));
};




 const addDeviceRow = () => {
  updateProduct(p => ({
    ...p,
    deviceIds: [...p.deviceIds, ''],
    deviceSizes: [...p.deviceSizes, ''],
  }));
};



  const removeDeviceRow = (deviceIndex) => {
  updateProduct(p => {
    const ids = p.deviceIds.filter((_, i) => i !== deviceIndex);
    const sizes = p.deviceSizes.filter((_, i) => i !== deviceIndex);

    return {
      ...p,
      deviceIds: ids.length ? ids : [''],
      deviceSizes: sizes.length ? sizes : [''],
    };
  });
};

  return (
    <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">

      {/* Header */}
      {productsLength > 1 && (
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Product {productIndex + 1}
          </span>
          <button
            type="button"
            onClick={() => onRemoveProduct(productIndex)}
            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        </div>
      )}

      {/* Core fields */}
      <input
        type="text"
        placeholder="Product Name *"
        value={product.name}
        onChange={e => updateField('name', e.target.value)}
        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl"
        required
      />

      <textarea
        placeholder="Description (optional)"
        value={product.description}
        onChange={e => updateField('description', e.target.value)}
        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl resize-none"
        rows={2}
      />

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Purchase Price "
          value={product.purchase_price}
          onChange={e => updateField('purchase_price', e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl"
           
        />
        <input
          type="number"
          placeholder="Selling Price"
          value={product.selling_price}
          onChange={e => updateField('selling_price', e.target.value)}
          className="px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl"
          required
        />
      </div>

      {/* Unique toggle */}
      <label className="flex gap-3 p-4 bg-white dark:bg-slate-800 border rounded-xl cursor-pointer">
        <input
          type="checkbox"
          checked={product.is_unique}
          onChange={e => toggleUnique(e.target.checked)}
          className="w-5 h-5"
        />
        <div>
          <span className="font-medium">Unique Items</span>
          <p className="text-xs text-slate-500">Track IMEI / Serial</p>
        </div>
      </label>

      {/* UNIQUE ITEMS */}
      {product.is_unique && (
        <div className="space-y-2">
          {product.deviceIds.map((id, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="IMEI / Serial"
                value={id}
                onChange={e => updateDeviceId(i, e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl"
              />

              <input
                type="text"
                placeholder="Size"
                value={product.deviceSizes[i] || ''}
                onChange={e => updateDeviceSize(i, e.target.value)}
                className="w-24 px-3 py-2.5 bg-white dark:bg-slate-800 border rounded-xl"
              />

              {/* CAMERA — PER ROW */}
              <button
                type="button"
                onClick={() => onOpenScanner(productIndex, i)}
                className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100"
              >
                <Camera className="w-4 h-4 text-indigo-600" />
              </button>

              {product.deviceIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDeviceRow(i)}
                  className="p-2 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addDeviceRow}
            className="flex items-center gap-1 text-indigo-600 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add another ID
          </button>
        </div>
      )}

      {/* NON-UNIQUE ITEMS */}
      {!product.is_unique && (
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Quantity"
            value={product.purchase_qty}
            onChange={e => updateField('purchase_qty', e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl"
          />

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Barcode / SKU"
              value={product.device_id}
              onChange={e => updateField('device_id', e.target.value)}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl"
            />

            {/* CAMERA — SKU */}
            <button
              type="button"
              onClick={() => onOpenScanner(productIndex, null)}
              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Size / Variant"
            value={product.device_size}
            onChange={e => updateField('device_size', e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
