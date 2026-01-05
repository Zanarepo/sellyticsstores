// components/WarehouseManagementPage.js
import React, { useState } from "react";
import { StockInForm } from "./StockInForm";
import { DispatchForm } from "./DispatchForm";
import { ReturnForm } from "./ReturnForm";
import { BarcodeScanner } from "./BarcodeScanner";
import { ScanMetadataEntry } from "./ScanMetadataEntry";
import { CommitScanSession } from "./CommitScanSession";
import { LedgerTable } from "./LedgerTable";

import { useSession } from "./useSession";
import { useWarehouses } from "./useWarehouses";
import { useWarehouseClients } from "./useWarehouseClients";
import { useWarehouseProducts } from "./useWarehouseProducts";

export function WarehouseManagementPage() {
  const { userId, storeId } = useSession();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Load warehouses for the current store
  const { warehouses, loading: warehousesLoading } = useWarehouses(); // uses storeId from session

  // Load clients (fixed: now filtered by warehouse)
  const { clients, loading: clientsLoading } = useWarehouseClients(selectedWarehouseId);

  // Load products for selected warehouse + client
  const { products, loading: productsLoading } = useWarehouseProducts(selectedWarehouseId, selectedClientId);

  // Auto-select first warehouse
  React.useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  // Auto-select first client when warehouse changes
  React.useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  // Reset client when warehouse changes
  React.useEffect(() => {
    setSelectedClientId(null);
  }, [selectedWarehouseId]);

  // Compute overview metrics
  const totalStockQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const lowStockItems = products.filter((p) => (p.quantity || 0) < (p.lowStockThreshold || 10)).length;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "stockin", label: "Stock In" },
    { key: "dispatch", label: "Dispatch" },
    { key: "returns", label: "Returns" },
    { key: "scanner", label: "Scanner" },
    { key: "ledger", label: "Ledger" },
  ];

  if (!storeId || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600 text-lg">Access denied: No store or user session found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Warehouse Selector */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Warehouse:</label>
                {warehousesLoading ? (
                  <span className="text-gray-500">Loading...</span>
                ) : (
                  <select
                    value={selectedWarehouseId || ""}
                    onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : null)}
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} {w.location && `(${w.location})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Client Selector */}
              {!selectedWarehouseId ? null : clientsLoading ? (
                <span className="text-gray-500">Loading clients...</span>
              ) : (
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Client:</label>
                  <select
                    value={selectedClientId || ""}
                    onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
                    disabled={!selectedWarehouseId}
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.client_type === "SELLYTICS_STORE"
                          ? `Store #${c.store_id}`
                          : c.external_name || `Client ${c.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && !selectedWarehouseId && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">Please select a warehouse to view overview.</p>
            </div>
          )}

          {activeTab === "overview" && selectedWarehouseId && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white shadow rounded-lg p-6">
                <dt className="text-sm font-medium text-gray-500">Total Products</dt>
                <dd className="mt-2 text-3xl font-bold text-gray-900">
                  {productsLoading ? "..." : products.length}
                </dd>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <dt className="text-sm font-medium text-gray-500">Total Stock</dt>
                <dd className="mt-2 text-3xl font-bold text-gray-900">
                  {productsLoading ? "..." : totalStockQuantity}
                </dd>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <dt className="text-sm font-medium text-gray-500">Low Stock Alerts</dt>
                <dd className="mt-2 text-3xl font-bold text-orange-600">
                  {productsLoading ? "..." : lowStockItems}
                </dd>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <dt className="text-sm font-medium text-gray-500">Clients</dt>
                <dd className="mt-2 text-3xl font-bold text-gray-900">{clients.length}</dd>
              </div>
            </div>
          )}

          {activeTab === "stockin" && selectedWarehouseId && selectedClientId && (
            <StockInForm warehouseId={selectedWarehouseId} clientId={selectedClientId} />
          )}

          {activeTab === "dispatch" && selectedWarehouseId && selectedClientId && (
            <DispatchForm warehouseId={selectedWarehouseId} clientId={selectedClientId} />
          )}

          {activeTab === "returns" && selectedWarehouseId && selectedClientId && (
            <ReturnForm warehouseId={selectedWarehouseId} clientId={selectedClientId} />
          )}

          {activeTab === "scanner" && selectedWarehouseId && selectedClientId && (
            <div className="space-y-8">
              <BarcodeScanner
                warehouseId={selectedWarehouseId}
                clientId={selectedClientId}
                userId={userId}
                onSessionStart={setCurrentSessionId}
              />
              {currentSessionId && (
                <>
                  <ScanMetadataEntry sessionId={currentSessionId} />
                  <CommitScanSession
                    sessionId={currentSessionId}
                    warehouseId={selectedWarehouseId}
                    clientId={selectedClientId}
                    userId={userId}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === "ledger" && selectedWarehouseId && (
            <LedgerTable warehouseId={selectedWarehouseId} clientId={selectedClientId} />
          )}

          {/* Disabled state message */}
          {["stockin", "dispatch", "returns", "scanner", "ledger"].includes(activeTab) &&
            (!selectedWarehouseId || !selectedClientId) && (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <p className="text-gray-600 text-lg">
                  Please select a <strong>warehouse</strong> and <strong>client</strong> to use this feature.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}