// pages/WarehousePage.js
import React from "react";
import { useWarehouses } from "../hooks/useWarehouses";
import { useWarehouseClients } from "../hooks/useWarehouseClients";
import { WarehouseDashboard } from "../components/WarehouseDashboard";
import { InventoryTable } from "../components/InventoryTable";

export function WarehousePage() {
  const { warehouses } = useWarehouses();
  const warehouseId = warehouses[0]?.id;
  const { clients } = useWarehouseClients(warehouseId);
  const clientId = clients[0]?.id;

  if (!warehouseId || !clientId) return <div>Loading warehouses or clients...</div>;

  return (
    <div>
      <h1>Warehouse Management</h1>
      <WarehouseDashboard warehouseId={warehouseId} clientId={clientId} />
      <InventoryTable warehouseId={warehouseId} clientId={clientId} />
    </div>
  );
}
