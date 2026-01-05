// ClientOnboardForm.jsx - Now supports both Add & Edit modes
import React from "react";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
} from "lucide-react";

export function ClientOnboardForm({
  form,
  errors,
  isSubmitting,
  isEditMode = false,    // ← New prop, default false for safety
  handleChange,
  handleSubmit,
  onClose,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Client Name */}
      <div className="space-y-2 md:col-span-1">
        <label className="block text-sm font-medium text-slate-700">
          Client Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={form.client_name || ""}
            onChange={(e) => handleChange("client_name", e.target.value)}
            placeholder="Contact or company name"
            className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors.client_name ? "border-rose-500" : "border-slate-300"
            }`}
          />
        </div>
        {errors.client_name && (
          <p className="text-sm text-rose-500">{errors.client_name}</p>
        )}
      </div>

      {/* Business Name */}
      <div className="space-y-2 md:col-span-1">
        <label className="block text-sm font-medium text-slate-700">
          Business Name
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={form.business_name || ""}
            onChange={(e) => handleChange("business_name", e.target.value)}
            placeholder="Legal business name"
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2 md:col-span-1">
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            value={form.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="email@example.com"
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2 md:col-span-1">
        <label className="block text-sm font-medium text-slate-700">Phone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={form.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 234 567 890"
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Address - Full width */}
      <div className="space-y-2 md:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <textarea
            value={form.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Business address"
            rows={3}
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
          />
        </div>
      </div>

      {/* Notes - Full width */}
      <div className="space-y-2 md:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={form.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Additional notes about this client..."
          rows={3}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 md:col-span-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full px-6 py-3.5 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition text-slate-700 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {isEditMode ? "Update Client" : "Add Client"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}