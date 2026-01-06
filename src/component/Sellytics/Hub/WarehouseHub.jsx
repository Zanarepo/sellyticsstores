// WarehouseHub.jsx - Final Clean Version
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ClientOnboardModal from "./ClientOnboardModal"; // Still here - used for external clients
import {
  Building2,
  Package,
  ArrowLeftRight,
  RotateCcw,
  AlertTriangle,
  Search,
  BarChart3,
  Warehouse,
  ChevronDown,
} from "lucide-react";

// Custom components
import WarehouseDashboardStats from "./WarehouseDashboardStats";
import StoresList from "./StoresList";
import WarehouseInventory from "./WarehouseInventory";
import TransferHub from "./TransferHub";
import ReturnsCenter from "./ReturnsCenter";
import StoreWorkspace from "./StoreWorkspace";
import ExternalClientsList from "./ExternalClientsList"; // New modular component

// Hooks
import { useSession } from "./useSession";
import { useWarehouses } from "./useWarehouses";
import { useWarehouseClients } from "./useWarehouseClients";
import { useWarehouseStats } from "./useWarehouseStats";


export default function WarehouseHub() {
const { userEmail, storeId } = useSession();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedStore, setSelectedStore] = useState(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const { warehouses } = useWarehouses();
  const { clients, loading: clientsLoading, refetch: refetchClients } = useWarehouseClients(selectedWarehouseId);
  const { stats, loading: statsLoading } = useWarehouseStats(selectedWarehouseId);

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  const internalStores = clients?.filter(c => c.client_type === "SELLYTICS_STORE") || [];
  const externalStores = clients?.filter(c => c.client_type !== "SELLYTICS_STORE") || [];

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    setActiveView("store-workspace");
  };

  const handleBackToDashboard = () => {
    setSelectedStore(null);
    setActiveView("dashboard");
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowOnboardModal(true);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowOnboardModal(true);
  };

  const handleOnboardSuccess = () => {
    setShowOnboardModal(false);
    setEditingClient(null);
    refetchClients();
  };

 if (!userEmail || !storeId) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl shadow-xl p-12 w-full max-w-md"
        >
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Required</h2>
          <p className="text-slate-600">Please log in to access the warehouse system.</p>
        </motion.div>
      </div>
    );
  }

  if (activeView === "store-workspace" && selectedStore) {
    return (
      <StoreWorkspace
        store={selectedStore}
        warehouseId={selectedWarehouseId}
        onBack={handleBackToDashboard}
      />
    );
  }

  const navigationItems = [
    { id: "dashboard", label: "Overview", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "transfers", label: "Transfers", icon: ArrowLeftRight },
    { id: "returns", label: "Returns", icon: RotateCcw },
  ];

  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
  <header className="md:sticky md:top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200 shadow-sm dark:bg-slate-950 dark:border-slate-800">
    <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
    
      {/* Mobile Layout - Fully Stacked */}
      <div className="flex flex-col gap-2 py-2 md:hidden">
        {/* Logo + Title Row */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
            <Warehouse className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Warehouse Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Inventory Management
            </p>
          </div>
        </div>

        {/* Warehouse Selector - Full Width */}
        <div className="relative">
          <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10 dark:text-slate-500" />
          <select
            value={selectedWarehouseId || ""}
            onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
            className="w-full pl-9 pr-9 py-2 text-sm border border-slate-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 active:ring-2 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          >
            <option value="" disabled>Select warehouse</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10 dark:text-slate-500" />
        </div>

        {/* Search Bar - Full Width */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white active:ring-2 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Desktop Layout - Horizontal */}
      <div className="hidden md:flex items-center justify-between gap-4 py-3">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm">
            <Warehouse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Warehouse Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inventory Management System
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Warehouse Selector */}
          <div className="relative w-48 lg:w-56">
            <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10 dark:text-slate-500" />
            <select
              value={selectedWarehouseId || ""}
              onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
              className="w-full pl-9 pr-9 py-2 text-sm border border-slate-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400 cursor-pointer transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white"
            >
              <option value="" disabled>Select warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10 dark:text-slate-500" />
          </div>

          {/* Search Bar */}
          <div className="relative w-48 lg:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white hover:bg-white hover:border-slate-400 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
            />
          </div>
        </div>
      </div>
    

          <nav className="flex gap-1 mt-4 -mb-px overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeView === item.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {!selectedWarehouseId ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-32">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-600">Select a Warehouse</h2>
              <p className="text-slate-400 mt-2">Choose a warehouse to view its dashboard</p>
            </div>
          </motion.div>
          
        ) : (
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <WarehouseDashboardStats stats={stats} loading={statsLoading} />

                <div className="space-y-8 ">
                  <StoresList
                    title="Internal Stores"
                    subtitle="Sellytics-managed stores"
                    stores={internalStores}
                    type="internal"
                    loading={clientsLoading}
                    onStoreSelect={handleStoreSelect}
                    warehouseId={selectedWarehouseId}
                    onRefresh={refetchClients}
                  />

                  <ExternalClientsList
                    externalClients={externalStores}
                    loading={clientsLoading}
                    warehouseId={selectedWarehouseId}
                    onStoreSelect={handleStoreSelect}
                    onEditClient={handleEditClient}
                    onAddClient={handleAddClient}
                    onRefresh={refetchClients}
                  />
                </div>
              </motion.div>
            )}

            {activeView === "inventory" && (
              <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <WarehouseInventory 
                warehouseId={selectedWarehouseId} clients={clients} 
                />
              </motion.div>
            )}

                  {activeView === "transfers" && (
          <motion.div
            key="transfers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TransferHub />
          </motion.div>
        )}

            {activeView === "returns" && (
              <motion.div key="returns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ReturnsCenter 
  selectedWarehouse={{
    id: selectedWarehouseId,
    name: warehouses.find(w => w.id === selectedWarehouseId)?.name || "Warehouse"
  }} 
  clients={clients} 
/>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Modal for Add/Edit External Clients */}
      <AnimatePresence>
        {showOnboardModal && (
          <ClientOnboardModal
            warehouseId={selectedWarehouseId}
            onClose={() => {
              setShowOnboardModal(false);
              setEditingClient(null);
            }}
            onSuccess={handleOnboardSuccess}
            initialData={editingClient}
          />
        )}
      </AnimatePresence>
    </div>
  );
}