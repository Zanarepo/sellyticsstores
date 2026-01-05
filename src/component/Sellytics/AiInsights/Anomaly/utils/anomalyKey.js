export function anomalyKey(a) {
  return [
    a.store_id,
    a.dynamic_product_id,
    a.anomaly_type,
    a.quantity,
    a.sold_at,
  ].join('|');
}
