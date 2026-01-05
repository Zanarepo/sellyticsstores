// components/ClientFormFields.jsx
import React from "react";
import { User, Building2, Mail, Phone, MapPin } from "lucide-react";

export default function ClientFormFields({ form, errors, handleChange }) {
  return (
    <div className="space-y-5">
      {/* Client Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Client Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={form.client_name}
            onChange={(e) => handleChange("client_name", e.target.value)}
            placeholder="Contact or company name"
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.client_name ? "border-rose-500" : "border-slate-300"
            }`}
          />
        </div>
        {errors.client_name && (
          <p className="text-sm text-rose-500">{errors.client_name}</p>
        )}
      </div>

      {/* Business Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Business Name</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => handleChange("business_name", e.target.value)}
            placeholder="Legal business name"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 234 567 890"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <textarea
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Business address"
            rows={3}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Additional notes about this client..."
          rows={2}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}