import React from 'react';
import { useWarehouseData } from './useWarehouseData';
import { useWarehouseMutations } from './useWarehouseMutations';
import { useWarehouseOperations } from './useWarehouseOperations';
import { useWarehouseStats } from './useWarehouseStats';
import { useWarehouseUI } from './useWarehouseUI';

import { 
  ArrowLeft,
  Warehouse as WarehouseIcon,
  Package,
  Users,
  PackagePlus,
  PackageMinus,
  RotateCcw,
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
//import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import InventoryGrid from "./InventoryGrid";
import LedgerView from "./LedgerView";
import ScannerPanel from "./ScannerPanel";
import IntakeModal from "./IntakeModal";
import DispatchModal from "./DispatchModal";
import ReturnRequestModal from "./ReturnRequestModal";
import ClientFormModal from "./ClientFormModal";
import ProductFormModal from "./ProductFormModal";

export default function WarehouseDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const warehouseId = urlParams.get('id');
  const initialTab = urlParams.get('tab') || 'overview';

  // Custom hooks for data, mutations, operations, and UI state
  const {
    warehouse,
    loadingWarehouse,
    clients,
    products,
    inventory,
    ledger,
    setShowDispatch,
    serialItems,
    returnRequests
  } = useWarehouseData(warehouseId);

  const {
    createClient,
    createProduct,
    createReturnRequest
  } = useWarehouseMutations();

  const { handleIntake, handleDispatch, isLoading } = useWarehouseOperations(warehouseId, inventory);

  const stats = useWarehouseStats(inventory, returnRequests, ledger);

  const {
    activeTab,
    setActiveTab,
    showScanner,
    scannerType,
    showIntake,
    showDispatch,
    showReturn,
    setShowReturn,
    showClientForm,
    setShowClientForm,
    showProductForm,
    setShowProductForm,
    scannedItems,
    openIntake,
    openDispatch,
    closeIntake,
    closeDispatch,
    openScanner,
    closeScanner,
    commitScan
  } = useWarehouseUI(initialTab);

  // Enrich inventory with product data
  const enrichedInventory = inventory.map(inv => ({
    ...inv,
    product: products.find(p => p.id === inv.warehouse_product_id)
  }));

  if (loadingWarehouse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <WarehouseIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Warehouse not found</h2>
          {/* Removed dependency on createPageUrl */}
          <Link to="/warehouses">
            <button className="inline-flex items-center justify-center rounded-lg px-4 py-2 border border-slate-300 hover:bg-slate-50 font-medium transition-all mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Warehouses
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Removed dependency on createPageUrl */}
              <Link to="/warehouses">
                <button className="inline-flex items-center justify-center h-10 w-10 rounded-lg hover:bg-slate-100 transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <WarehouseIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{warehouse.name}</h1>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 font-mono">{warehouse.code}</span>
                      {warehouse.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 border border-slate-300 hover:bg-slate-50 font-medium transition-all"
                onClick={openIntake}
              >
                <PackagePlus className="w-4 h-4 mr-2" />
                Stock In
              </button>
              <button 
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 border border-slate-300 hover:bg-slate-50 font-medium transition-all"
                onClick={openDispatch}
              >
                <PackageMinus className="w-4 h-4 mr-2" />
                Dispatch
              </button>
              <button 
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 border border-slate-300 hover:bg-slate-50 font-medium transition-all"
                onClick={() => setShowReturn(true)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Returns
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="inline-flex bg-white border rounded-lg p-1">
            {['overview', 'inventory', 'ledger', 'clients', 'products'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Total Stock</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.totalStock.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Available</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.availableStock.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Low Stock</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.lowStockCount}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Pending Returns</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.pendingReturns}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Recent Inbound
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-3xl font-bold text-emerald-600">+{stats.recentIn}</p>
                  <p className="text-sm text-slate-500 mt-1">units in last 10 transactions</p>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                    Recent Outbound
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-3xl font-bold text-orange-600">-{stats.recentOut}</p>
                  <p className="text-sm text-slate-500 mt-1">units in last 10 transactions</p>
                </div>
              </div>
            </div>

            {/* Quick Inventory View */}
            <InventoryGrid 
              inventory={enrichedInventory}
              products={products}
              onDispatch={(inv) => {
                setShowDispatch(true);
              }}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <InventoryGrid 
              inventory={enrichedInventory}
              products={products}
              onDispatch={(inv) => setShowDispatch(true)}
              onAdjust={(inv) => {
                // TODO: Implement adjustment modal
              }}
            />
          </div>
        )}

        {activeTab === 'ledger' && (
          <div>
            <LedgerView 
              ledgerEntries={ledger}
              products={products}
              clients={clients}
            />
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Warehouse Clients</h2>
              <button 
                onClick={() => setShowClientForm(true)}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div key={client.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {client.external_name || `Store #${client.store_id}`}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border border-slate-200 mt-1">
                          {client.client_type.replace('_', ' ')}
                        </span>
                        {client.external_email && (
                          <p className="text-sm text-slate-500 mt-1 truncate">{client.external_email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Warehouse Products</h2>
              <button 
                onClick={() => setShowProductForm(true)}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.product_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {product.sku && (
                            <span className="text-xs text-slate-500 font-mono">{product.sku}</span>
                          )}
                          {product.is_serialized && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Serialized</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scanner Panel */}
      <ScannerPanel
        isOpen={showScanner}
        onClose={closeScanner}
        onCommit={(items) => commitScan(items, scannerType)}
        onCancel={closeScanner}
        products={products}
        existingSerials={serialItems.map(s => s.serial_number)}
        sessionType={scannerType}
      />

      {/* Modals */}
      <IntakeModal
        open={showIntake}
        onClose={closeIntake}
        onSubmit={async (data) => {
          const success = await handleIntake(data);
          if (success) closeIntake();
        }}
        onOpenScanner={() => openScanner('INTAKE')}
        clients={clients}
        products={products}
        scannedItems={scannedItems}
        isLoading={isLoading}
      />

      <DispatchModal
        open={showDispatch}
        onClose={closeDispatch}
        onSubmit={async (data) => {
          const success = await handleDispatch(data);
          if (success) closeDispatch();
        }}
        onOpenScanner={() => openScanner('DISPATCH')}
        clients={clients}
        inventory={enrichedInventory}
        scannedItems={scannedItems}
        isLoading={isLoading}
      />

      <ReturnRequestModal
        open={showReturn}
        onClose={() => setShowReturn(false)}
        onSubmit={(data) => {
          createReturnRequest.mutate(data);
          setShowReturn(false);
        }}
        warehouse={warehouse}
        clients={clients}
        products={products}
        isLoading={createReturnRequest.isPending}
      />

      <ClientFormModal
        open={showClientForm}
        onClose={() => setShowClientForm(false)}
        onSubmit={(data) => {
          createClient.mutate(data);
          setShowClientForm(false);
        }}
        isLoading={createClient.isPending}
      />

      <ProductFormModal
        open={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSubmit={(data) => {
          createProduct.mutate(data);
          setShowProductForm(false);
        }}
        warehouse={warehouse}
        clients={clients}
        isLoading={createProduct.isPending}
      />
    </div>
  );
}