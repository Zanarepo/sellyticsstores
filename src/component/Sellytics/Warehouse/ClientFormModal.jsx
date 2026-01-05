import React, { useState, useEffect } from 'react';
import { Loader2, Users, Store, User, Building2 } from "lucide-react";

const CLIENT_TYPES = [
  { value: 'SELLYTICS_STORE', label: 'Sellytics Store', icon: Store, description: 'Auto-syncs with store inventory' },
  { value: 'EXTERNAL_STORE', label: 'External Store', icon: Building2, description: 'Notified via email/export' },
  { value: 'INDIVIDUAL', label: 'Individual', icon: User, description: 'Personal storage client' }
];

export default function ClientFormModal({
  open,
  onClose,
  onSubmit,
  client = null,
  isLoading = false,
  stores = []
}) {
  const [formData, setFormData] = useState({
    client_type: 'EXTERNAL_STORE',
    store_id: '',
    external_name: '',
    external_email: '',
    external_phone: '',
    is_active: true
  });

  useEffect(() => {
    if (client) {
      setFormData({
        client_type: client.client_type || 'EXTERNAL_STORE',
        store_id: client.store_id?.toString() || '',
        external_name: client.external_name || '',
        external_email: client.external_email || '',
        external_phone: client.external_phone || '',
        is_active: client.is_active !== false
      });
    } else {
      setFormData({
        client_type: 'EXTERNAL_STORE',
        store_id: '',
        external_name: '',
        external_email: '',
        external_phone: '',
        is_active: true
      });
    }
  }, [client, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (formData.client_type !== 'SELLYTICS_STORE') {
      delete submitData.store_id;
    } else {
      submitData.store_id = parseInt(formData.store_id);
    }
    onSubmit(submitData);
  };

  const selectedType = CLIENT_TYPES.find(t => t.value === formData.client_type);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">
                {client ? 'Edit Client' : 'Add Client'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 transition hover:opacity-100"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Client Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Client Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {CLIENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.client_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, client_type: type.value }))}
                    className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-2 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-indigo-700' : 'text-slate-600'
                    }`}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedType && (
              <p className="mt-2 text-xs text-slate-500">
                {selectedType.description}
              </p>
            )}
          </div>

          {/* Conditional Fields */}
          {formData.client_type === 'SELLYTICS_STORE' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Select Store *</label>
              <select
                value={formData.store_id}
                onChange={(e) => setFormData(prev => ({ ...prev, store_id: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Choose a store...</option>
                {stores.length === 0 ? (
                  <option disabled>No stores available</option>
                ) : (
                  stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.shop_name}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <>
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="external_name" className="text-sm font-medium text-slate-700">
                  {formData.client_type === 'INDIVIDUAL' ? 'Full Name' : 'Business Name'} *
                </label>
                <input
                  id="external_name"
                  type="text"
                  value={formData.external_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_name: e.target.value }))}
                  placeholder={formData.client_type === 'INDIVIDUAL' ? 'John Doe' : 'Acme Corp'}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="external_email" className="text-sm font-medium text-slate-700">
                  Email Address *
                </label>
                <input
                  id="external_email"
                  type="email"
                  value={formData.external_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_email: e.target.value }))}
                  placeholder="contact@example.com"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="external_phone" className="text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  id="external_phone"
                  type="tel"
                  value={formData.external_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex flex-row-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              (formData.client_type === 'SELLYTICS_STORE'
                ? !formData.store_id
                : !formData.external_name || !formData.external_email)
            }
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-medium text-white shadow-md transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              client ? 'Update Client' : 'Add Client'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}