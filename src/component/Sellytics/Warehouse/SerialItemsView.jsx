import React, { useState } from "react";
import {
  Barcode,
  Search,
  Copy,
  Download,
  CheckCircle2,
  Package as PackageIcon,
  AlertTriangle,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CONFIG = {
  IN_STOCK: {
    icon: CheckCircle2,
    label: "In Stock",
    color: "bg-emerald-100 text-emerald-700"
  },
  DISPATCHED: {
    icon: PackageIcon,
    label: "Dispatched",
    color: "bg-blue-100 text-blue-700"
  },
  DAMAGED: {
    icon: AlertTriangle,
    label: "Damaged",
    color: "bg-red-100 text-red-700"
  },
  RETURNED: {
    icon: RotateCcw,
    label: "Returned",
    color: "bg-amber-100 text-amber-700"
  }
};

export default function SerialItemsView({
  open,
  onClose,
  product,
  serialItems = []
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (!open) return null;

  const productSerials = serialItems.filter(
    s => s.warehouse_product_id === product?.id
  );

  const filteredSerials = productSerials.filter(serial => {
    const matchesSearch = serial.serial_number
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || serial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    IN_STOCK: productSerials.filter(s => s.status === "IN_STOCK").length,
    DISPATCHED: productSerials.filter(s => s.status === "DISPATCHED").length,
    DAMAGED: productSerials.filter(s => s.status === "DAMAGED").length,
    RETURNED: productSerials.filter(s => s.status === "RETURNED").length
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const exportCSV = () => {
    const headers = ["Serial Number", "Status", "Created Date"];
    const rows = filteredSerials.map(s => [
      s.serial_number,
      s.status,
      format(new Date(s.created_date || s.created_at), "yyyy-MM-dd")
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `serials-${product?.product_name
      ?.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Barcode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Serial Numbers</h2>
            <p className="text-sm text-gray-500">
              {product?.product_name} • {productSerials.length} total
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Summary */}
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const Icon = config.icon;
              const active = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(active ? "all" : status)
                  }
                  className={`p-2 rounded-lg border text-center transition ${
                    active
                      ? `${config.color} border-current`
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4 mx-auto mb-1" />
                  <span className="block text-lg font-bold">
                    {statusCounts[status]}
                  </span>
                  <span className="text-xs">{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search + Export */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search serial numbers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={exportCSV}
              className="px-3 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {/* Table */}
          <div className="h-[350px] border rounded-lg overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Serial Number</th>
                  <th className="text-center px-3 py-2">Status</th>
                  <th className="w-[50px]" />
                </tr>
              </thead>
              <tbody>
                {filteredSerials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-12 text-gray-500"
                    >
                      <Barcode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No serial numbers found
                    </td>
                  </tr>
                ) : (
                  filteredSerials.map(serial => {
                    const cfg = STATUS_CONFIG[serial.status];
                    const Icon = cfg?.icon || CheckCircle2;

                    return (
                      <tr
                        key={serial.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 font-mono">
                          {serial.serial_number}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${cfg?.color}`}
                          >
                            <Icon className="w-3 h-3" />
                            {cfg?.label}
                          </span>
                        </td>
                        <td className="px-2">
                          <button
                            onClick={() =>
                              copyToClipboard(serial.serial_number)
                            }
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="h-4 w-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Copy All */}
          {filteredSerials.length > 0 && (
            <button
              className="w-full px-4 py-2 border rounded-md flex items-center justify-center gap-2 hover:bg-gray-50"
              onClick={() =>
                copyToClipboard(
                  filteredSerials.map(s => s.serial_number).join("\n")
                )
              }
            >
              <Copy className="h-4 w-4" />
              Copy All {filteredSerials.length} Serial Numbers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
