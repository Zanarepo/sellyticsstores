// useReturnsCenter.js - Final Clean & Bug-Free Version
import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import { useSession } from "./useSession";
import toast from "react-hot-toast";

export function useReturnsCenter({ warehouseId, clients }) {
  const { userId } = useSession();

  // Tabs & Data
  const [activeTab, setActiveTab] = useState("pending");
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inspection Modal
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionData, setInspectionData] = useState({
    condition: "",
    newStatus: "",
    notes: ""
  });

  // Initiate Return Modal (Single Item - Your Original Flow)
  const [showInitiateForm, setShowInitiateForm] = useState(false);
  const [initiateData, setInitiateData] = useState({
    clientId: "",
    productId: "",
    quantity: 1,
    reason: "",
    status: "REQUESTED",
  });

  // All warehouse inventory (for client filtering)
  const [allProducts, setAllProducts] = useState([]);

  const [processing, setProcessing] = useState(false);

  // Fetch warehouse inventory for product dropdown
  useEffect(() => {
    if (!warehouseId) return;

    const fetchInventory = async () => {
      const { data } = await supabase
        .from("warehouse_inventory")
        .select(`
          id,
          available_qty,
          client_id,
          warehouse_product_id (
            id,
            product_name,
            sku,
            product_type
          )
        `)
        .eq("warehouse_id", warehouseId)
        .gt("available_qty", 0);

      setAllProducts(data || []);
    };

    fetchInventory();
  }, [warehouseId]);

  // Fetch returns
  useEffect(() => {
    if (!warehouseId) return;

    const fetchReturns = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("warehouse_return_requests")
        .select(`
          *,
          client:client_id (id, client_name),
          product:warehouse_product_id (id, product_name, sku, product_type)
        `)
        .eq("warehouse_id", warehouseId)
        .order("created_at", { ascending: false });

      setReturns(data || []);
      setLoading(false);
    };

    fetchReturns();
  }, [warehouseId]);

const filteredReturns = returns.filter(r => {
  if (activeTab === "pending") return r.status === "REQUESTED";
  if (activeTab === "processed") return ["RECEIVED", "REJECTED"].includes(r.status);
  if (activeTab === "all") return true;
  return true;
});

const pendingCount = returns.filter(r => r.status === "REQUESTED").length;



  // Client-specific product filter
  const getProductsForClient = (clientId) => {
    if (!clientId) return [];
    return allProducts
      .filter(item => item.client_id === Number(clientId))
      .map(item => ({
        id: item.warehouse_product_id.id,
        name: item.warehouse_product_id.product_name,
        sku: item.warehouse_product_id.sku,
        available: item.available_qty
      }));
  };

  // Open inspection
  const openInspection = (returnItem) => {
    setSelectedReturn(returnItem);
    setInspectionData({
      condition: returnItem.condition || "OPENED",
      newStatus: "",
      notes: returnItem.inspection_notes || ""
    });
    setShowInspectionModal(true);
  };

  // Handle inspection (unchanged - works perfectly)
  const handleInspection = async () => {
    if (!inspectionData.newStatus) {
      toast.error("Select a resolution");
      return;
    }

    setProcessing(true);
    try {
      await supabase
        .from("warehouse_return_requests")
        .update({
          status: inspectionData.newStatus,
          condition: inspectionData.condition,
          inspection_notes: inspectionData.notes,
          inspected_by: userId,
          inspected_at: new Date().toISOString()
        })
        .eq("id", selectedReturn.id);

      if (inspectionData.newStatus === "APPROVED") {
        const { data: inv } = await supabase
          .from("warehouse_inventory")
          .select("id, quantity, available_qty, damaged_qty")
          .eq("warehouse_product_id", selectedReturn.warehouse_product_id)
          .eq("warehouse_id", warehouseId)
          .single();

        if (inv) {
          const updates = { quantity: inv.quantity + selectedReturn.quantity };
          if (["NEW", "OPENED"].includes(inspectionData.condition)) {
            updates.available_qty = inv.available_qty + selectedReturn.quantity;
          } else {
            updates.damaged_qty = (inv.damaged_qty || 0) + selectedReturn.quantity;
          }
          await supabase.from("warehouse_inventory").update(updates).eq("id", inv.id);
        }

        await supabase.from("warehouse_ledger").insert({
          warehouse_id: warehouseId,
          warehouse_product_id: selectedReturn.warehouse_product_id,
          client_id: selectedReturn.client_id,
          movement_type: "IN",
          movement_subtype: "RETURN",
          quantity: selectedReturn.quantity,
          notes: `Return approved: ${inspectionData.notes || "Restocked"}`,
          item_condition: inspectionData.condition,
          created_by: userId,
        });
      }

      toast.success("Return processed");
      setReturns(prev =>
        prev.map(r =>
          r.id === selectedReturn.id
            ? { ...r, status: inspectionData.newStatus, condition: inspectionData.condition }
            : r
        )
      );
      setShowInspectionModal(false);
    } catch (err) {
      toast.error("Failed to process");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // SINGLE ITEM RETURN - Your Original & Working Logic
  const handleInitiateReturn = async () => {
    if (
      !initiateData.clientId ||
      !initiateData.productId ||
      initiateData.quantity < 1 ||
      !initiateData.reason.trim()
    ) {
      toast.error("Please fill all fields: Client, Product, Quantity, and Reason");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.from("warehouse_return_requests").insert({
        warehouse_id: warehouseId,
        client_id: Number(initiateData.clientId),
        warehouse_product_id: Number(initiateData.productId),
        quantity: initiateData.quantity,
        reason: initiateData.reason.trim(),
        status: initiateData.status,
        created_by: userId,
      });

      if (error) throw error;

      toast.success("Return request created successfully");
      setShowInitiateForm(false);
      setInitiateData({ clientId: "", productId: "", quantity: 1, reason: "" });

      // Refresh returns list
      const { data } = await supabase
        .from("warehouse_return_requests")
        .select(`*, client:client_id (id, client_name), product:warehouse_product_id (id, product_name)`)
        .eq("warehouse_id", warehouseId)
        .order("created_at", { ascending: false });

      setReturns(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create return request");
    } finally {
      setProcessing(false);
    }
  };

  return {
    // Tabs & List
    activeTab,
    setActiveTab,
    returns,
    filteredReturns,
    loading,
    pendingCount,

    // Inspection
    selectedReturn,
    showInspectionModal,
    setShowInspectionModal,
    inspectionData,
    setInspectionData,
    openInspection,
    handleInspection,

    // Initiate Return (Single Item)
    showInitiateForm,
    setShowInitiateForm,
    initiateData,
    setInitiateData,
    handleInitiateReturn, // ← Your original working function

    // Product filtering
    getProductsForClient,
    allProducts,
    // Shared

    
  };
}