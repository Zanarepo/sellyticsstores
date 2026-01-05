// components/StoreWorkspace/StoreWorkspace.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import StockInForm from "./StockInForm";
import DispatchForm from "./DispatchForm";
import ReturnsCenter from "./ReturnsCenter";
import ProductModal from "./ProductModal";

import StoreHeader from "./StoreHeader";
import InventorySection from "./InventorySection";
import HistorySection from "./HistorySection";

import { useSession } from "./useSession";
import { useWarehouseProducts } from "./useWarehouseProducts";
import { useWarehouseInventory } from "./useWarehouseInventory";
import { useProductModal } from "./useProductModal";
import { useLedger } from "./useLedger";
import { useCurrency } from "../../context/currencyContext";

export default function StoreWorkspace({ store, warehouseId, onBack }) {
  const { userId } = useSession();
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");

  const { formatPrice } = useCurrency();
  const isInternal = store.client_type === "SELLYTICS_STORE";

  const { products, loading: productsLoading, refetch: refetchProducts } =
    useWarehouseProducts(warehouseId, store.id);

  const { inventory, loading: inventoryLoading, refetch: refetchInventory } =
    useWarehouseInventory(warehouseId, store.id);

  const { entries: ledgerEntries, loading: ledgerLoading } = useLedger(store.id);

  const productModal = useProductModal({
    warehouseId,
    clientId: store.id,
    userId,
    onRefresh: () => {
      refetchProducts();
      refetchInventory();
    },
  });

  const inventoryData = inventory
    .map((inv) => {
      const product = products.find((p) => p.id === inv.warehouse_product_id);
      return product ? { ...inv, product } : null;
    })
    .filter(Boolean);

  const filteredInventory = inventoryData.filter((item) => {
    const lower = searchQuery.toLowerCase();
    return (
      item.product.product_name?.toLowerCase().includes(lower) ||
      item.product.sku?.toLowerCase().includes(lower)
    );
  });

  const totalStock = inventoryData.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const availableStock = inventoryData.reduce((sum, i) => sum + (i.available_qty || 0), 0);
  const totalInventoryValue = inventoryData.reduce(
    (sum, i) => sum + (parseFloat(i.total_cost) || 0),
    0
  );

  const refreshData = () => {
    refetchProducts();
    refetchInventory();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50  dark:bg-slate-950 dark:text-gray-500" >
      <StoreHeader
        store={store}
        onBack={onBack}
        totalStock={totalStock}
        availableStock={availableStock}
        totalInventoryValue={totalInventoryValue}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 ">
        <AnimatePresence mode="wait">
          {activeTab === "inventory" && (
            <InventorySection
              isInternal={isInternal}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredInventory={filteredInventory}
              productsLoading={productsLoading}
              inventoryLoading={inventoryLoading}
              formatPrice={formatPrice}
              productModal={productModal}
            />
          )}

          {activeTab === "stock-in" && (
            <motion.div
              key="stock-in"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StockInForm
                warehouseId={warehouseId}
                clientId={store.id}
                products={products}
                onSuccess={refreshData}
              />
            </motion.div>
          )}

          {activeTab === "dispatch" && (
            <motion.div
              key="dispatch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DispatchForm
                warehouseId={warehouseId}
                clientId={store.id}
                inventory={inventoryData}
                onSuccess={refreshData}
              />
            </motion.div>
          )}

          {activeTab === "returns" && (
            <motion.div
              key="returns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReturnsCenter warehouseId={warehouseId} clients={[store]} />
            </motion.div>
          )}

          {activeTab === "history" && (
            <HistorySection
              ledgerEntries={ledgerEntries}
              ledgerLoading={ledgerLoading}
              
             
                
            />
          )}
        </AnimatePresence>
      </main>

      <ProductModal
        show={productModal.show}
        editingProduct={productModal.editingProduct}
        productName={productModal.productName}
        setProductName={productModal.setProductName}
        sku={productModal.sku}
        unitCost={productModal.unitCost}           // ← ADD THIS
        setDamagedQty={productModal.setDamagedQty}  
        setQuantity={productModal.setQuantity}  
        setUnitCost={productModal.setUnitCost}
        setSku={productModal.setSku}
        productType={productModal.productType}
        setProductType={productModal.setProductType}
        processing={productModal.processing}
        PRODUCT_TYPES={productModal.PRODUCT_TYPES}
        onClose={productModal.close}
        onSubmit={productModal.handleSubmit}
        deleteProduct={productModal.deleteProduct}
        
      />
    </div>
  );
}