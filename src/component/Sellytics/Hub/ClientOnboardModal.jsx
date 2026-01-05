// ClientOnboardModal.jsx - Fixed for Edit Mode
import React from "react";
import { Building2, X } from "lucide-react";
import { useClientOnboard } from "./useClientOnboard";
import { ClientOnboardForm } from "./ClientOnboardForm";

export default function ClientOnboardModal({
  warehouseId,
  initialData,     // ← Add this prop
  onClose,
  onSuccess
}) {
  const {
    form,
    errors,
    isSubmitting,
    isEditMode,     // ← We'll use this for better title/buttons
    handleChange,
    handleSubmit,
  } = useClientOnboard({
    warehouseId,
    initialData,     // ← Pass it here!
    onSuccess,
    onClose
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg md:max-w-2xl max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200">
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <Building2 className="w-6 h-6 text-indigo-600" />
            {isEditMode ? "Edit External Client" : "Onboard External Client"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <ClientOnboardForm
            form={form}
            errors={errors}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}