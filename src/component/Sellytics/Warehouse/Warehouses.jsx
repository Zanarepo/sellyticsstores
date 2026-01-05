import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../supabaseClient';

import { 
  Plus, 
  Search, 
  Warehouse as WarehouseIcon,
  Loader2,
} from "lucide-react";

import  toast  from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

import WarehouseCard from "./WarehouseCard";
import WarehouseFormModal from "./WarehouseFormModal";

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  // Fetch warehouses
  const { data: warehouses = [], isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['warehouse-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_products')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['warehouse-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_clients')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Create warehouse
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('warehouses')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      setShowForm(false);
      toast.success('Warehouse created successfully');
    }
  });

  // Update warehouse
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('warehouses')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      setShowForm(false);
      setEditingWarehouse(null);
      toast.success('Warehouse updated successfully');
    }
  });

  // Delete warehouse
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      toast.success('Warehouse deleted successfully');
    }
  });

  const filteredWarehouses = warehouses.filter(wh =>
    wh.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (data) => {
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getWarehouseStats = (warehouseId) => {
    const productCount = products.filter(p => p.warehouse_id === warehouseId).length;
    const clientCount = new Set(
      products
        .filter(p => p.warehouse_id === warehouseId)
        .map(p => p.client_id)
    ).size;
    return { productCount, clientCount };
  };

  const totalProducts = products.length;
  const totalClients = clients.length;
  const activeWarehouses = warehouses.filter(w => w.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <WarehouseIcon className="w-5 h-5 text-white" />
                </div>
                Warehouse Management
              </h1>
              <p className="text-slate-500 mt-1">
                Manage your warehouses and inventory locations
              </p>
            </div>

            <button
              onClick={() => {
                setEditingWarehouse(null);
                setShowForm(true);
              }}
              className="inline-flex items-center rounded-lg px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Warehouse
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-slate-500">Active Warehouses</p>
            <p className="text-3xl font-bold">{activeWarehouses}</p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-slate-500">Total Products</p>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <p className="text-sm text-slate-500">Total Clients</p>
            <p className="text-3xl font-bold">{totalClients}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full h-10 border rounded-lg"
          />
        </div>

        {/* Warehouses */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredWarehouses.map((warehouse) => {
                const stats = getWarehouseStats(warehouse.id);
                return (
                  <WarehouseCard
                    key={warehouse.id}
                    warehouse={warehouse}
                    inventoryCount={stats.productCount}
                    clientCount={stats.clientCount}
                    onView={(wh) => {
                      window.location.href = `/warehouse-dashboard?id=${wh.id}`;
                    }}
                    onEdit={(wh) => {
                      setEditingWarehouse(wh);
                      setShowForm(true);
                    }}
                    onDelete={(wh) => {
                      if (window.confirm('Are you sure you want to delete this warehouse?')) {
                        deleteMutation.mutate(wh.id);
                      }
                    }}
                    onManageClients={(wh) => {
                      window.location.href = `/warehouse-dashboard?id=${wh.id}&tab=clients`;
                    }}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <WarehouseFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingWarehouse(null);
        }}
        onSubmit={handleSubmit}
        warehouse={editingWarehouse}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
