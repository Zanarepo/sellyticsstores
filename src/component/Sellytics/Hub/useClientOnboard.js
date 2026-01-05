// useClientOnboard.js - Fixed for Edit Mode Support
import { useState, useEffect } from "react";
import { useSession } from "./useSession";
import { supabase } from "../../../supabaseClient";
import toast from "react-hot-toast";

export function useClientOnboard({ warehouseId, initialData, onSuccess, onClose }) {
  const { userId } = useSession();

  const [form, setForm] = useState({
    client_name: "",
    business_name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Populate form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setForm({
        client_name: initialData.client_name || "",
        business_name: initialData.business_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        notes: initialData.notes || ""
      });
      setIsEditMode(true);
    } else {
      // Reset to empty for "Add New"
      setForm({
        client_name: "",
        business_name: "",
        email: "",
        phone: "",
        address: "",
        notes: ""
      });
      setIsEditMode(false);
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.client_name.trim()) {
      newErrors.client_name = "Client name is required";
    }

    // Optional: prevent duplicate name except for itself in edit mode
    if (isEditMode && form.client_name.trim() === initialData?.client_name.trim()) {
      // Same name as current → allowed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // === EDIT MODE: Update existing client ===
        const { error } = await supabase
          .from("warehouse_clients")
          .update({
            client_name: form.client_name.trim(),
            business_name: form.business_name.trim() || null,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            address: form.address.trim() || null,
            notes: form.notes.trim() || null,
            updated_at: new Date().toISOString(), // optional: track updates
            updated_by: userId
          })
          .eq("id", initialData.id)
          .eq("warehouse_id", warehouseId);

        if (error) throw error;

        toast.success(`Client "${form.client_name}" updated successfully`);
      } else {
        // === ADD MODE: Check duplicate then insert ===
        const { data: existing } = await supabase
          .from("warehouse_clients")
          .select("id")
          .eq("warehouse_id", warehouseId)
          .ilike("client_name", form.client_name.trim())
          .eq("client_type", "EXTERNAL")
          .eq("is_active", true);

        if (existing?.length > 0) {
          toast.error("A client with this name already exists");
          setErrors({ client_name: "Client already exists" });
          return;
        }

        const { error } = await supabase
          .from("warehouse_clients")
          .insert({
            warehouse_id: warehouseId,
            client_type: "EXTERNAL",
            client_name: form.client_name.trim(),
            business_name: form.business_name.trim() || null,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            address: form.address.trim() || null,
            notes: form.notes.trim() || null,
            is_active: true,
            created_by: userId
          });

        if (error) throw error;

        toast.success(`Client "${form.client_name}" added successfully`);
      }

      onSuccess?.();
      onClose();

    } catch (error) {
      console.error("Submit error:", error);
      toast.error(`Failed to ${isEditMode ? "update" : "add"} client: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      client_name: "",
      business_name: "",
      email: "",
      phone: "",
      address: "",
      notes: ""
    });
    setErrors({});
    setIsEditMode(false);
  };

  return {
    form,
    errors,
    isSubmitting,
    isEditMode,
    handleChange,
    handleSubmit,
    resetForm
  };
}