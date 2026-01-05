// hooks/useProductFormLogic.js
import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export const useProductFormLogic = ({
  warehouseId,
  clientId,
  userId,
  initialData = null,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = (form, quantity) => {
    const newErrors = {};

    if (!form.product_name.trim()) {
      newErrors.product_name = "Product name is required";
    }

    if (quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (form, quantity, uniqueIdentifiers = null) => {
    if (!validate(form, quantity)) {
      toast.error("Please fix the errors");
      return;
    }

    setIsSubmitting(true);

    try {
      // Duplicate name check (skip on edit)
      if (!initialData) {
        const { data: existing } = await supabase
          .from("warehouse_products")
          .select("id")
          .eq("warehouse_id", warehouseId)
          .eq("warehouse_client_id", clientId)
          .ilike("product_name", form.product_name.trim());

        if (existing?.length > 0) {
          toast.error("A product with this name already exists");
          setErrors({ product_name: "Product already exists" });
          setIsSubmitting(false);
          return;
        }
      }

      // Upsert product
      const { data: product, error: productError } = await supabase
        .from("warehouse_products")
        .upsert({
          id: initialData?.id || undefined,
          warehouse_id: warehouseId,
          warehouse_client_id: clientId,
          product_name: form.product_name.trim(),
          sku: form.sku.trim() || null,
          product_type: form.product_type,
          metadata: {
            description: form.description || null,
            purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
            markup_percent: form.markup_percent ? parseFloat(form.markup_percent) : null,
            selling_price: form.selling_price ? parseFloat(form.selling_price) : null,
          },
        })
        .select()
        .single();

      if (productError) throw productError;

      // Add initial stock to ledger
      if (quantity > 0) {
        await supabase.from("warehouse_ledger").insert({
          warehouse_id: warehouseId,
          warehouse_product_id: product.id,
          client_id: clientId,
          movement_type: "IN",
          movement_subtype: "INITIAL_STOCK",
          quantity,
          unique_identifiers: uniqueIdentifiers,
          created_by: userId,
          notes: initialData ? "Stock update" : "Initial stock on creation",
          item_condition: "GOOD",
        });
      }

      toast.success(`Product "${form.product_name}" saved successfully!`);
      onSuccess?.();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errors,
    setErrors,
    handleSubmit,
  };
};