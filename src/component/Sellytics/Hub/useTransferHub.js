// useTransferHub.js - Fully Fixed & Complete Multi-Client Version
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../supabaseClient";
import { useSession } from "./useSession";
import toast from "react-hot-toast";

export function useTransferHub() {
  const { userEmail, ownerId, storeId } = useSession();

  const [activeTab, setActiveTab] = useState("new");
  const [sourceWarehouseId, setSourceWarehouseId] = useState("");
  const [sourceClientId, setSourceClientId] = useState("");
  const [destinationStoreId, setDestinationStoreId] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [userStores, setUserStores] = useState([]);
  const [userWarehouses, setUserWarehouses] = useState([]);
  const [warehouseClients, setWarehouseClients] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch user stores
  useEffect(() => {
    if (!ownerId && !storeId) return;

    const fetchStores = async () => {
      let query = supabase.from("stores").select("id, shop_name");
      if (ownerId) query = query.eq("owner_user_id", Number(ownerId));
      else query = query.eq("id", Number(storeId));

      const { data } = await query.order("shop_name");
      setUserStores(data || []);
    };

    fetchStores();
  }, [ownerId, storeId]);

  // Fetch user's warehouses
  useEffect(() => {
    if (!ownerId && !storeId) {
      setUserWarehouses([]);
      return;
    }

    const fetchWarehouses = async () => {
      let allowedStoreIds = [];

      if (ownerId) {
        const { data } = await supabase
          .from("stores")
          .select("id")
          .eq("owner_user_id", Number(ownerId));
        allowedStoreIds = data?.map((s) => s.id) || [];
      } else if (storeId) {
        allowedStoreIds = [Number(storeId)];
      }

      if (allowedStoreIds.length === 0) {
        setUserWarehouses([]);
        return;
      }

      const { data } = await supabase
        .from("warehouses")
        .select("id, name")
        .in("owner_store_id", allowedStoreIds)
        .eq("is_active", true)
        .order("name");

      setUserWarehouses(data || []);
    };

    fetchWarehouses();
  }, [ownerId, storeId]);

  // Fetch clients for selected warehouse
  useEffect(() => {
    if (!sourceWarehouseId) {
      setWarehouseClients([]);
      setSourceClientId("");
      return;
    }

    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("warehouse_clients")
        .select("id, client_name, business_name, client_type")
        .eq("warehouse_id", sourceWarehouseId)
        .eq("is_active", true)
        .order("client_name");

      if (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
        setWarehouseClients([]);
      } else {
        setWarehouseClients(data || []);
      }
    };

    fetchClients();
  }, [sourceWarehouseId]);

  // Fetch inventory when warehouse + client selected
  useEffect(() => {
    if (!sourceWarehouseId || !sourceClientId) {
      setAvailableProducts([]);
      return;
    }

    const fetchInventory = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("warehouse_inventory")
        .select(`
          id,
          available_qty,
          warehouse_product:warehouse_product_id (
            id,
            product_name,
            sku,
            product_type,
            metadata
          )
        `)
        .eq("warehouse_id", sourceWarehouseId)
        .eq("client_id", sourceClientId)  // Fixed: correct column
        .gt("available_qty", 0);

      if (error) {
        console.error("Error fetching inventory:", error);
        toast.error("Failed to load inventory");
        setAvailableProducts([]);
      } else {
        const flattened = (data || []).map((row) => ({
          id: row.id,
          available_qty: row.available_qty,
          warehouse_product_id: row.warehouse_product,
        }));
        setAvailableProducts(flattened);
      }

      setLoading(false);
    };

    fetchInventory();
  }, [sourceWarehouseId, sourceClientId]);

  // Filtered products based on search
  const filteredProducts = useMemo(() => {
    return availableProducts.filter((item) => {
      const p = item.warehouse_product_id;
      const q = searchQuery.toLowerCase();
      return (
        p.product_name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    });
  }, [availableProducts, searchQuery]);

  // Cart actions
  const addToTransfer = (item) => {
    const p = item.warehouse_product_id;
    const existing = selectedItems.find((i) => i.productId === p.id);

    if (existing) {
      if (existing.quantity < item.available_qty) {
        setSelectedItems((prev) =>
          prev.map((i) =>
            i.productId === p.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        );
      }
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          productId: p.id,
          productName: p.product_name,
          sku: p.sku,
          productType: p.product_type,
          metadata: p.metadata,
          quantity: 1,
          maxQuantity: item.available_qty,
          inventoryId: item.id,
        },
      ]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(
            1,
            Math.min(item.maxQuantity, item.quantity + delta)
          );
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromTransfer = (productId) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);

  // Execute transfer
  const executeTransfer = async () => {
    if (
      !sourceWarehouseId ||
      !sourceClientId ||
      !destinationStoreId ||
      selectedItems.length === 0
    ) {
      toast.error("Please complete all selections");
      return;
    }

    setTransferring(true);

    try {
      const destinationStore = userStores.find(
        (s) => s.id.toString() === destinationStoreId
      );
      if (!destinationStore) throw new Error("Destination store not found");

      // Create transfer record
      
      const { data: transfer, error: transferError } = await supabase
        .from("warehouse_transfers")
        
        .insert({
          warehouse_id: Number(sourceWarehouseId),
          destination_store_id: Number(destinationStoreId),
          status: "COMPLETED",
          total_items: totalItems,
          created_by: userEmail,
        })
        .select()
        .single();

      if (transferError || !transfer) {
        throw transferError || new Error("Failed to create transfer");
      }

      // Process each item
      for (const item of selectedItems) {
        await supabase.from("warehouse_transfer_items").insert({
          transfer_id: transfer.id,
          warehouse_product_id: item.productId,
          quantity: item.quantity,
        });

        await supabase.rpc("decrement_warehouse_inventory", {
          inventory_id: item.inventoryId,
          qty: item.quantity,
        });

        await supabase.from("warehouse_ledger").insert({
          warehouse_id: Number(sourceWarehouseId),
          client_id: Number(sourceClientId),
          warehouse_product_id: item.productId,
          movement_type: "OUT",
          movement_subtype: "TRANSFER",
          quantity: item.quantity,
          notes: `Transfer to ${destinationStore.shop_name}`,
          created_by: userEmail,
        });

        await supabase.rpc("upsert_dynamic_inventory", {
          p_store_id: Number(destinationStoreId),
          p_product_name: item.productName,
          p_is_unique: item.productType === "SERIALIZED",
          p_quantity: item.quantity,
          p_created_by_email: userEmail,
        });
      }

      toast.success(
        `Transferred ${totalItems} items to ${destinationStore.shop_name}`
      );

      // Reset
      setSelectedItems([]);
      setDestinationStoreId("");
      setShowConfirmModal(false);

      // Refresh inventory
      const { data: refreshed } = await supabase
        .from("warehouse_inventory")
        .select(`
          id,
          available_qty,
          warehouse_product:warehouse_product_id (
            id,
            product_name,
            sku,
            product_type,
            metadata
          )
        `)
        .eq("warehouse_id", sourceWarehouseId)
        .eq("client_id", sourceClientId)
        .gt("available_qty", 0);

      const flattened = (refreshed || []).map((row) => ({
        id: row.id,
        available_qty: row.available_qty,
        warehouse_product_id: row.warehouse_product,
      }));

      setAvailableProducts(flattened);
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error(error.message || "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  // Fetch transfer history across all user warehouses
  useEffect(() => {
    if (userWarehouses.length === 0) {
      setTransfers([]);
      return;
    }

    const fetchTransfers = async () => {
      const warehouseIds = userWarehouses.map((w) => w.id);

      const { data, error } = await supabase
        .from("warehouse_transfers")
        .select(`
          id,
          warehouse_id,
          destination_store_id,
          status,
          total_items,
          created_by,
          created_at,
          destination_store:destination_store_id (shop_name),
          items:warehouse_transfer_items (
            quantity,
            product:warehouse_product_id (product_name)
          )
        `)
        .in("warehouse_id", warehouseIds)  // ← Correct: .in() for array filtering
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transfer history:", error);
        toast.error("Failed to load transfer history");
        setTransfers([]);
      } else {
        setTransfers(data || []);
      }
    };

    fetchTransfers();
  }, [userWarehouses]);





  return {
    activeTab,
    setActiveTab,
    sourceWarehouseId,
    setSourceWarehouseId,
    sourceClientId,
    setSourceClientId,
    warehouseClients,
    destinationStoreId,
    setDestinationStoreId,
    availableProducts,
    filteredProducts,
    selectedItems,
    searchQuery,
    setSearchQuery,
    loading,
    transferring,
    transfers,
    userStores,
    userWarehouses,
    showConfirmModal,
    setShowConfirmModal,
    totalItems,
    addToTransfer,
    updateQuantity,
    removeFromTransfer,
    executeTransfer,
  };
}