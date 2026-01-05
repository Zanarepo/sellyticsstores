// useProductFormatter.js
export function useProductFormatter() {
  const formatProduct = (product) => ({
    ...product,
    is_unique: product.is_unique ?? false,
    deviceList: product.is_unique && product.dynamic_product_imeis
      ? product.dynamic_product_imeis.split(',').map(s => s.trim()).filter(Boolean)
      : [],
    sizeList: product.is_unique && product.device_size
      ? product.device_size.split(',').map(s => s.trim())
      : []
  });

  return { formatProduct };
}
