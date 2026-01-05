// WarehouseInventory.jsx - Now Fully Mobile Responsive
import React, { useState, useEffect } from "react";
import { 
  Package, 
  Loader2,
  ArrowUpDown,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../../../supabaseClient";
import { useCurrency } from "../../context/currencyContext" 

export default function WarehouseInventory({ warehouseId, clients }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState("");
  const [clientFilter] = useState("all");
  const [typeFilter] = useState("all");
  const [sortBy] = useState("name");
  const [sortOrder] = useState("asc");

  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      
      let query = supabase
        .from("warehouse_inventory")
        .select(`
          *,
          total_cost,
          warehouse_product_id (
            id,
            product_name,
            sku,
            product_type,
            warehouse_client_id,
            metadata
          )
        `)
        .eq("warehouse_id", warehouseId);

      const { data, error } = await query;

      if (!error) {
        const enriched = (data || []).map(item => {
          const client = clients.find(c => c.id === item.warehouse_product_id?.warehouse_client_id);
          return {
            ...item,
            product: item.warehouse_product_id,
            client
          };
        }).filter(item => item.product);

        setInventory(enriched);
      }
      setLoading(false);
    };

    fetchInventory();
  }, [warehouseId, clients]);

  // Filter and sort
  const filteredInventory = inventory
    .filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        item.product?.product_name?.toLowerCase().includes(searchLower) ||
        item.product?.sku?.toLowerCase().includes(searchLower);
      
      const matchesClient = clientFilter === "all" || 
        item.client?.id?.toString() === clientFilter;
      
      const matchesType = typeFilter === "all" || 
        item.product?.product_type === typeFilter;

      return matchesSearch && matchesClient && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.product?.product_name || "").localeCompare(b.product?.product_name || "");
          break;
        case "quantity":
          comparison = (a.quantity || 0) - (b.quantity || 0);
          break;
        case "available":
          comparison = (a.available_qty || 0) - (b.available_qty || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Totals for stats cards
  const totalProducts = filteredInventory.length;
  const totalStock = filteredInventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalAvailable = filteredInventory.reduce((sum, i) => sum + (i.available_qty || 0), 0);
  const totalDamaged = filteredInventory.reduce((sum, i) => sum + (i.damaged_qty || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Section - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="rounded-xl shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-indigo-100">Total Products</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalProducts}</p>
            <p className="text-xs text-indigo-200 mt-0.5 hidden sm:block">Products in this warehouse</p>
          </div>
        </div>

        {/* Total Stock */}
        <div className="rounded-xl shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ArrowUpDown className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-emerald-100">Total Stock</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalStock.toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-0.5 hidden sm:block">Total quantity in warehouse</p>
          </div>
        </div>

        {/* Available */}
        <div className="rounded-xl shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-blue-100">Available</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalAvailable.toLocaleString()}</p>
            <p className="text-xs text-blue-200 mt-0.5 hidden sm:block">Ready for transfer/sale</p>
          </div>
        </div>

        {/* Damaged */}
        <div className="rounded-xl shadow-md bg-gradient-to-br from-rose-500 to-rose-600 text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-rose-100">Damaged</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">{totalDamaged.toLocaleString()}</p>
            <p className="text-xs text-rose-200 mt-0.5 hidden sm:block">Damaged or unusable items</p>
          </div>
        </div>
      </div>

      {/* Inventory Cards - Responsive Layout */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-600">No inventory found</h3>
            <p className="text-sm text-slate-400 mt-1">
              {searchQuery ? "Try adjusting your search" : "Add products to see inventory"}
            </p>
          </div>
        ) : (
          filteredInventory.map((item) => (
            <div
              key={item.id}
              className="relative p-4 sm:p-6 w-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 flex-shrink-0">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate text-base sm:text-lg">
                    {item.product?.product_name}
                  </h3>
                  {item.product?.sku && (
                    <p className="text-xs text-slate-500 mt-1">SKU: {item.product.sku}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium">
                      {item.product?.product_type || "-"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium">
                      {item.client?.client_name || "Unknown"}
                    </span>
                    {item.product?.is_unique && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase">
                        UNIQUE
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity & Value - Responsive */}
                <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-1 text-sm w-full md:w-auto">
                  <p className="flex justify-between md:justify-end">
                    <span className="font-semibold">Total:</span> <span>{item.quantity || 0}</span>
                  </p>
                  <p className="text-emerald-600 flex justify-between md:justify-end">
                    <span className="font-semibold">Available:</span> <span>{item.available_qty || 0}</span>
                  </p>
                  <p className="text-rose-600 flex justify-between md:justify-end">
                    <span className="font-semibold">Damaged:</span> <span>{item.damaged_qty || 0}</span>
                  </p>
                  <p className="flex justify-between md:justify-end">
                    <span className="font-semibold">Value:</span>{" "}
                    {item.total_cost > 0 ? formatPrice(item.total_cost) : "-"}
                  </p>
                </div>
              </div>

              {/* Meta - Responsive */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 gap-2">
                {item.created_at && <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>}
                {item.updated_by_email && (
                  <span>
                    Updated by: <span className="text-indigo-600">{item.updated_by_email.split('@')[0]}</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}