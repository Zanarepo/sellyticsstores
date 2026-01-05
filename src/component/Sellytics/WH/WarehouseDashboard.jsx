// components/WarehouseDashboard.js
import React, { useState, useEffect } from "react";
import { useSession } from "./useSession";
import { useWarehouses } from "./useWarehouses";
import { useWarehouseClients } from "./useWarehouseClients";
import { ClientCard } from "./ClientCard";
import { ClientOnboardModal } from "./ClientOnboardModal";
import { ProductAddForm } from "./ProductAddForm";
import { StockInForm } from "./StockInForm";
import { DispatchForm } from "./DispatchForm";
import { LedgerTable } from "./LedgerTable";
import { supabase } from '../../../supabaseClient';


export function WarehouseDashboard() {
  const { userId, storeId } = useSession();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [ setOwnStoreName] = useState("My Store");

  const { warehouses, loading: warehousesLoading } = useWarehouses();
  const { clients, loading: clientsLoading, refetch: refetchClients } = useWarehouseClients(selectedWarehouseId);

  // Fetch actual store name
  useEffect(() => {
    if (!storeId) return;

    const fetchStoreName = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("shop_name")
        .eq("id", storeId)
        .single();

      if (error) {
        console.error("Failed to fetch store name:", error);
      } else if (data?.shop_name) {
        setOwnStoreName(data.shop_name);
      }
    };

    fetchStoreName();
  }, [storeId]);

  // Auto-select first warehouse
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  // REMOVED: The auto-onboarding useEffect that caused duplicates

  // Auto-select your own store client (if exists)
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      const ownClient = clients.find((c) => c.client_type === "SELLYTICS_STORE");
      if (ownClient) {
        setSelectedClient(ownClient);
        setActiveTab("products");
      } else {
        setSelectedClient(clients[0]); // fallback to first client
      }
    }
  }, [clients, selectedClient]);

  // Reset selected client when warehouse changes
  useEffect(() => {
    setSelectedClient(null);
  }, [selectedWarehouseId]);

  if (!userId || !storeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 mb-4">Access Denied</p>
          <p className="text-gray-600">Session expired or invalid. Please log in again.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "products", label: "Products" },
    { id: "stockin", label: "Stock In" },
    { id: "dispatch", label: "Dispatch" },
    { id: "ledger", label: "Ledger" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Warehouse Dashboard</h1>

            {warehousesLoading ? (
              <div className="w-64 h-12 bg-gray-200 rounded animate-pulse" />
            ) : (
              <select
                value={selectedWarehouseId || ""}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setSelectedWarehouseId(value);
                  setSelectedClient(null);
                  setActiveTab("products");
                }}
                className="px-6 py-3 border border-gray-300 rounded-xl text-lg font-medium focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {!selectedWarehouseId ? (
          <div className="text-center py-32 bg-white rounded-2xl shadow">
            <p className="text-3xl text-gray-600 font-light">
              Please select a warehouse to manage clients and inventory
            </p>
          </div>
        ) : (
          <>
            <section className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Clients</h2>
                <button
                  onClick={() => setShowOnboardModal(true)}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-lg font-semibold shadow-md transition"
                >
                  + Onboard External Client
                </button>
              </div>

              {clientsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl shadow">
                  <p className="text-2xl text-gray-600 mb-8">
                    No clients onboarded yet. Use the button above to add one.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {clients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      isSelected={selectedClient?.id === client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setActiveTab("products");
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Client Operations */}
            {selectedClient && (
              <section className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-8">
                  <h2 className="text-4xl font-bold text-white">
                    Managing: {selectedClient.client_name}
                  </h2>
                  <p className="text-indigo-100 mt-2 text-lg">
                    {selectedClient.business_name && selectedClient.business_name !== selectedClient.client_name
                      ? selectedClient.business_name
                      : selectedClient.client_type === "SELLYTICS_STORE"
                      ? "Your Sellytics Store"
                      : "External Client"}
                  </p>
                </div>

                <div className="border-b border-gray-200">
                  <nav className="flex space-x-12 px-10 -mb-px">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-6 px-2 border-b-4 font-semibold text-lg transition-all ${
                          activeTab === tab.id
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-10">
                  {activeTab === "products" && (
                    <ProductAddForm
                      warehouseId={selectedWarehouseId}
                      clientId={selectedClient.id}
                      onSuccess={() => {}}
                    />
                  )}
                  {activeTab === "stockin" && (
                    <StockInForm warehouseId={selectedWarehouseId} clientId={selectedClient.id} />
                  )}
                  {activeTab === "dispatch" && (
                    <DispatchForm warehouseId={selectedWarehouseId} clientId={selectedClient.id} />
                  )}
                  {activeTab === "ledger" && (
                    <LedgerTable warehouseId={selectedWarehouseId} clientId={selectedClient.id} />
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Onboard Modal */}
      {showOnboardModal && selectedWarehouseId && (
        <ClientOnboardModal
          warehouseId={selectedWarehouseId}
          onClose={() => setShowOnboardModal(false)}
          onSuccess={refetchClients}
        />
      )}
    </div>
  );
}