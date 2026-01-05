// components/ClientOnboardModal.js
import React, { useState } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";

export function ClientOnboardModal({ warehouseId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    business_name: "",
    email: "",
    phone: "",
    address: "",
    external_reference: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim()) {
      toast.error("Contact name is required");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("warehouse_clients").insert({
      warehouse_id: warehouseId,
      client_type: "EXTERNAL",
      client_name: form.client_name.trim(),
      business_name: form.business_name.trim() || form.client_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      external_reference: form.external_reference.trim() || null,
    });

    if (error) {
      toast.error("Failed to onboard client");
      console.error(error);
    } else {
      toast.success(`${form.client_name} onboarded successfully!`);
      onSuccess(); // refetch clients
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">Onboard External Client</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person Name <span className="text-red-500">*</span>
            </label>
            <input
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="FashionHub NG"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">External Reference (e.g., Shopify URL)</label>
            <input
              name="external_reference"
              value={form.external_reference}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Onboard Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}