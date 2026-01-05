// hooks/useProductModal.js
import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

const PRODUCT_TYPES = [
  { value: "STANDARD", label: "Standard", desc: "Regular items – counted by quantity" },
  { value: "SERIALIZED", label: "Serialized", desc: "Each unit has a unique serial/barcode" },
  { value: "BATCH", label: "Batch", desc: "All units share the same barcode" },
];

export const useProductModal = ({ warehouseId, clientId, userId, onRefresh }) => {
  const [show, setShow] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [productType, setProductType] = useState("STANDARD");
  const [unitCost, setUnitCost] = useState("");

  // Inventory inputs (blank = no change)
  const [quantity, setQuantity] = useState("");
  const [damagedQty, setDamagedQty] = useState("");

  const [processing, setProcessing] = useState(false);

  const open = (product = null, inventory = null) => {
    setEditingProduct(product);

    setProductName(product?.product_name || "");
    setSku(product?.sku || "");
    setProductType(product?.product_type || "STANDARD");
    setUnitCost(product?.unit_cost ?? "");

    // IMPORTANT: preload inventory but allow clearing to mean "no change"
    setQuantity(inventory?.quantity?.toString() ?? "");
    setDamagedQty(inventory?.damaged_qty?.toString() ?? "");

    setShow(true);
  };

  const close = () => {
    setShow(false);
    setEditingProduct(null);

    setProductName("");
    setSku("");
    setProductType("STANDARD");
    setUnitCost("");
    setQuantity("");
    setDamagedQty("");
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      return toast.error("Product name is required");
    }

    // ---- Parse inputs safely (blank = null, NOT zero) ----
    const cleanedSku = sku.trim() ? sku.trim().toUpperCase() : null;
    const parsedUnitCost = unitCost === "" ? null : Number(unitCost);
    const parsedQuantity = quantity === "" ? null : Number(quantity);
    const parsedDamaged = damagedQty === "" ? null : Number(damagedQty);

    // ---- Validation ----
    if (parsedUnitCost !== null && (isNaN(parsedUnitCost) || parsedUnitCost < 0)) {
      return toast.error("Unit cost must be a positive number");
    }

    if (parsedQuantity !== null && (!Number.isInteger(parsedQuantity) || parsedQuantity < 0)) {
      return toast.error("Quantity must be a valid non-negative integer");
    }

    if (parsedDamaged !== null && (!Number.isInteger(parsedDamaged) || parsedDamaged < 0)) {
      return toast.error("Damaged quantity must be a valid non-negative integer");
    }

    if (
      parsedQuantity !== null &&
      parsedDamaged !== null &&
      parsedDamaged > parsedQuantity
    ) {
      return toast.error("Damaged quantity cannot exceed total quantity");
    }

    setProcessing(true);

    try {
      let productId;

      // ====================================================
      // PRODUCT SAVE (PATCH-style update)
      // ====================================================
      if (editingProduct) {
        const productUpdate = {
          product_name: productName.trim(),
          product_type: productType,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        };

        if (cleanedSku !== null) productUpdate.sku = cleanedSku;
        if (parsedUnitCost !== null) productUpdate.unit_cost = parsedUnitCost;

        const { error } = await supabase
          .from("warehouse_products")
          .update(productUpdate)
          .eq("id", editingProduct.id);

        if (error) {
          if (error.code === "23505") {
            return toast.error("This SKU already exists for this client");
          }
          throw error;
        }

        productId = editingProduct.id;
      } else {
        const { data, error } = await supabase
          .from("warehouse_products")
          .insert({
            warehouse_id: warehouseId,
            warehouse_client_id: clientId,
            product_name: productName.trim(),
            sku: cleanedSku,
            product_type: productType,
            unit_cost: parsedUnitCost,
            created_by: userId,
          })
          .select("id")
          .single();

        if (error) {
          if (error.code === "23505") {
            return toast.error("This SKU already exists for this client");
          }
          throw error;
        }

        productId = data.id;
      }

      // ====================================================
      // INVENTORY SAVE (ENTERPRISE SAFE LOGIC)
      // ====================================================
      const inventoryPayload = {
        warehouse_id: warehouseId,
        warehouse_product_id: productId,
        client_id: clientId,
      };

      // Only update what user explicitly changed
      if (parsedQuantity !== null) inventoryPayload.quantity = parsedQuantity;
      if (parsedDamaged !== null) inventoryPayload.damaged_qty = parsedDamaged;
      if (parsedUnitCost !== null) inventoryPayload.unit_cost = parsedUnitCost;

      // If stock-related fields changed, recompute available_qty safely
      if (parsedQuantity !== null || parsedDamaged !== null) {
        const { data: existingInv, error } = await supabase
          .from("warehouse_inventory")
          .select("quantity, damaged_qty")
          .eq("warehouse_product_id", productId)
          .eq("client_id", clientId)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        const finalQuantity =
          parsedQuantity ?? existingInv?.quantity ?? 0;

        const finalDamaged =
          parsedDamaged ?? existingInv?.damaged_qty ?? 0;

        inventoryPayload.available_qty = finalQuantity - finalDamaged;
      }

      const { error: invError } = await supabase
        .from("warehouse_inventory")
        .upsert(inventoryPayload, {
          onConflict: "warehouse_product_id,client_id",
        });

      if (invError) throw invError;

      toast.success(editingProduct ? "Product updated" : "Product added");

      close();
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setProcessing(false);
    }
  };
const deleteProduct = async (product) => {
  if (!product?.id) return;

  setProcessing(true);

  try {
    // 1️⃣ Delete inventory records first (FK safety)
    const { error: invError } = await supabase
      .from("warehouse_inventory")
      .delete()
      .eq("warehouse_product_id", product.id)
      .eq("client_id", clientId);

    if (invError) throw invError;

    // 2️⃣ Delete product
    const { error: prodError } = await supabase
      .from("warehouse_products")
      .delete()
      .eq("id", product.id)
      .eq("warehouse_client_id", clientId);

    if (prodError) throw prodError;

    toast.success("Product deleted");

    onRefresh();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete product");
  } finally {
    setProcessing(false);
  }
};

  return {
    show,
    editingProduct,
    productName,
    setProductName,
    sku,
    setSku,
    productType,
    setProductType,
    unitCost,
    deleteProduct,
    setUnitCost,
    quantity,
    setQuantity,
    damagedQty,
    setDamagedQty,
    processing,
    PRODUCT_TYPES,
    open,
    close,
    handleSubmit,
  };
};
