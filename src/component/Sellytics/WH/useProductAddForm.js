import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";
import { useCreateScanSession } from "./useCreateScanSession";
import { useBarcodeScanner } from "./useBarcodeScanner";
import { useSession } from "./useSession";

export function useProductAddForm({ warehouseId, clientId, onSuccess }) {
  const { userId } = useSession();
  const { createSession } = useCreateScanSession();

  const [mode, setMode] = useState("manual");
  const [sessionId, setSessionId] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [form, setForm] = useState({
    product_name: "",
    sku: "",
    product_type: "STANDARD",
  });

  const { scannedItems, duplicates, scan } = useBarcodeScanner({
    sessionId,
    warehouseId,
    clientId,
    userId,
  });

  // Auto-update quantity
  useEffect(() => {
    if (mode === "scan") {
      setQuantity(scannedItems.length);
    }
  }, [scannedItems.length, mode]);

  const startScanSession = async () => {
    const id = await createSession(warehouseId, clientId, userId);
    if (id) setSessionId(id);
  };

  const submit = async () => {
    if (!form.product_name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const { data: existing } = await supabase
      .from("warehouse_products")
      .select("id")
      .eq("warehouse_id", warehouseId)
      .eq("warehouse_client_id", clientId)
      .ilike("product_name", form.product_name.trim());

    if (existing?.length > 0) {
      toast.error("Product with this name already exists");
      return;
    }

    const finalQty = mode === "manual" ? Number(quantity) : scannedItems.length;
    const uniqueIdentifiers =
      form.product_type === "SERIALIZED"
        ? scannedItems.map(i => i.scanned_value)
        : null;

    if (form.product_type === "SERIALIZED" && finalQty === 0) {
      toast.error("Scan at least one serial for serialized product");
      return;
    }

    const { data: product, error } = await supabase
      .from("warehouse_products")
      .insert({
        warehouse_id: warehouseId,
        warehouse_client_id: clientId,
        product_name: form.product_name.trim(),
        sku: form.sku.trim() || null,
        product_type: form.product_type,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create product");
      return;
    }

    if (finalQty > 0) {
      await supabase.from("warehouse_ledger").insert({
        warehouse_id: warehouseId,
        warehouse_product_id: product.id,
        client_id: clientId,
        movement_type: "IN",
        movement_subtype: "STANDARD",
        quantity: finalQty,
        unique_identifiers: uniqueIdentifiers,
        created_by: userId,
        notes:
          mode === "scan"
            ? "Initial stock via serial scanning"
            : "Initial stock on creation",
        item_condition: "GOOD",
      });
    }

    toast.success(`Product "${form.product_name}" created with ${finalQty} unit(s)!`);
    setForm({ product_name: "", sku: "", product_type: "STANDARD" });
    setQuantity(0);
    setSessionId(null);
    onSuccess?.();
  };

  return {
    mode,
    setMode,
    form,
    setForm,
    quantity,
    setQuantity,
    scannedItems,
    duplicates,
    sessionId,
    startScanSession,
    scan,
    submit,
  };
}
