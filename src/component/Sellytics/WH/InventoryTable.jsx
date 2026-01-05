// components/InventoryTable.js
import React from "react";
import { useWarehouseInventory } from "../hooks/useWarehouseInventory";
import { useWarehouseProducts } from "../hooks/useWarehouseProducts";

export function InventoryTable({ warehouseId, clientId }) {
  const { products } = useWarehouseProducts(warehouseId, clientId);
  const productIds = products.map((p) => p.id);
  const { inventory } = useWarehouseInventory(productIds);

  const rows = products.map((product) => {
    const stock = inventory.find((i) => i.warehouse_product_id === product.id) || {};
    return {
      id: product.id,
      name: product.product_name,
      total: stock.quantity || 0,
      available: stock.available_qty || 0,
      damaged: stock.damaged_qty || 0,
    };
  });

  return (
    <div>
      <h3>Current Inventory</h3>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Total Stock</th>
            <th>Available</th>
            <th>Damaged</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.total}</td>
              <td>{r.available}</td>
              <td>{r.damaged}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No inventory found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
