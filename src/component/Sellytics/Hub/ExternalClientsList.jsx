// ExternalClientsSection.jsx
import React from "react";
import { Building2, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../../supabaseClient";

const ClientActionsDropdown = ({ onEdit, onDelete }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-600" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit Client
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to delete this client?")) {
                  onDelete();
                }
                setOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete Client
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function ExternalClientsSection({
  externalClients,
  loading,
  warehouseId,
  onStoreSelect,
  onEditClient,
  onAddClient,
  onRefresh,
}) {
  const handleDeleteClient = async (clientId) => {
    try {
      const { error } = await supabase
        .from("warehouse_clients")
        .update({ is_active: false })
        .eq("id", clientId)
        .eq("warehouse_id", warehouseId);

      if (error) throw error;

      toast.success("Client deleted successfully");
      onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete client");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
          >
            <div className="h-6 bg-slate-200 rounded w-64 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">External Clients</h3>
        <button
          onClick={onAddClient}
          className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {externalClients.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No external clients yet</p>
          <button
            onClick={onAddClient}
            className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
          >
            Add your first client
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {externalClients.map((client) => (
            <div
              key={client.id}
              onClick={() => onStoreSelect(client)}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h4 className="font-semibold text-slate-900">{client.client_name}</h4>
                {client.business_name && (
                  <p className="text-sm text-slate-600">{client.business_name}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {client.email || client.phone || "No contact info"}
                </p>
              </div>

              {/* Dropdown appears on hover (desktop) and always tappable (mobile) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ClientActionsDropdown
                  onEdit={() => onEditClient(client)}
                  onDelete={() => handleDeleteClient(client.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}