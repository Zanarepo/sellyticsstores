/**
 * Returns Service Layer
 * Handles all Supabase interactions for returns management
 */

export class ReturnsService {
  constructor(supabase, warehouseId, userId) {
    this.supabase = supabase;
    this.warehouseId = warehouseId;
    this.userId = userId;
  }


  
async fetchReturns({ 
  page = 1, 
  pageSize = 50, 
  status = null, 
  warehouseFilter = null 
}) {
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Base query
    let query = this.supabase
      .from('warehouse_return_requests')
      .select(`
        id,
        warehouse_id,
        client_id,
        warehouse_product_id,
        quantity,
        return_type,
        reason,
        status,
        created_at,

        client:warehouse_clients!client_id!inner (
          id,
          client_type,
          client_name,
          business_name,
          email,
          phone,
          warehouse_id
        ),

        product:warehouse_products!warehouse_product_id!inner (
          id,
          product_name,
          sku,
          product_type
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    // Warehouse filter
    if (warehouseFilter) {
      query = query.eq('warehouse_id', Number(warehouseFilter));
    } else {
      query = query.eq('warehouse_id', this.warehouseId); // default
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'pending') {
        query = query.eq('status', 'REQUESTED');
      } else if (status === 'processed') {
        query = query.in('status', ['RECEIVED', 'REJECTED']);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching returns:', error);
      throw error;
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error fetching returns:', error);
    throw error;
  }
}


  /**
   * Get aggregate counts for dashboard
   */
  async getCounts() {
    try {
      const { data, error } = await this.supabase
        .from('warehouse_return_requests')
        .select('status', { count: 'exact' })
        .eq('warehouse_id', this.warehouseId);

      if (error) throw error;

      const counts = {
        pending: 0,
        processed: 0,
        total: data?.length || 0
      };

      data?.forEach(item => {
        if (item.status === 'REQUESTED') counts.pending++;
        else counts.processed++;
      });

      return counts;
    } catch (error) {
      console.error('Error fetching counts:', error);
      return { pending: 0, processed: 0, total: 0 };
    }
  }

  /**
   * Fetch warehouse inventory for product selection
   */
async fetchInventory(clientId = null) {
  try {
    let query = this.supabase
      .from('warehouse_inventory')
      .select(`
        id,
        available_qty,
        client_id,
        warehouse_product_id,
        warehouse_products!inner (
          id,
          product_name,
          sku,
          product_type
        )
      `)
      .eq('warehouse_id', this.warehouseId)
      .gt('available_qty', 0);  // Only show products in stock

    // Filter by client when creating return for specific client
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query.order('warehouse_products(product_name)', { ascending: true });

    if (error) {
      console.error('Supabase error fetching inventory:', error);
      throw error;
    }

    console.log('Fetched inventory for returns form:', data); // ← Keep this for now

    return data || [];
  } catch (error) {
    console.error('Error in fetchInventory:', error);
    throw error;
  }
}


  /**
   * Create a new return request
   */
  async createReturn(returnData) {
    try {
      const { data, error } = await this.supabase
        .from('warehouse_return_requests')
        .insert({
          warehouse_id: this.warehouseId,
          client_id: returnData.clientId,
          warehouse_product_id: returnData.productId,
          quantity: returnData.quantity,
          reason: returnData.reason,
          status: returnData.status || 'REQUESTED',
          created_by: this.userId,
          returned_by: returnData.returnedBy || this.userId
        })
        .select(`
          *,
          client:warehouse_clients!client_id (id, client_type, client_name, stores (shop_name)),
          product:warehouse_products!warehouse_product_id (id, product_name, sku)
        `)
        .single();

      if (error) throw error;

      // Audit log
      await this.createAuditLog({
        action: 'RETURN_CREATED',
        return_id: data.id,
        details: { quantity: returnData.quantity, status: returnData.status }
      });

      return data;
    } catch (error) {
      console.error('Error creating return:', error);
      throw error;
    }
  }

  /**
   * Process return inspection
   */
  async processReturn(returnId, inspectionData) {
    try {
      const { data: returnItem, error: fetchError } = await this.supabase
        .from('warehouse_return_requests')
        .select('*')
        .eq('id', returnId)
        .single();

      if (fetchError) throw fetchError;

      // Update return status
      const { data: updatedReturn, error: updateError } = await this.supabase
        .from('warehouse_return_requests')
        .update({
          status: inspectionData.newStatus,
          condition: inspectionData.condition,
          inspection_notes: inspectionData.notes,
          inspected_by: this.userId,
          inspected_at: new Date().toISOString()
        })
        .eq('id', returnId)
        .select(`
          *,
          client:warehouse_clients!client_id (id, client_type, client_name, stores (shop_name)),
          product:warehouse_products!warehouse_product_id (id, product_name, sku)
        `)
        .single();

      if (updateError) throw updateError;

      // If approved, update inventory
      if (inspectionData.newStatus === 'APPROVED') {
        await this.restockInventory(returnItem, inspectionData.condition);
      }

      // Audit log
      await this.createAuditLog({
        action: 'RETURN_PROCESSED',
        return_id: returnId,
        details: { 
          status: inspectionData.newStatus, 
          condition: inspectionData.condition,
          notes: inspectionData.notes 
        }
      });

      return updatedReturn;
    } catch (error) {
      console.error('Error processing return:', error);
      throw error;
    }
  }

  /**
   * Restock inventory after approval
   */
  async restockInventory(returnItem, condition) {
    try {
      const { data: inv, error: invError } = await this.supabase
        .from('warehouse_inventory')
        .select('id, quantity, available_qty, damaged_qty')
        .eq('warehouse_product_id', returnItem.warehouse_product_id)
        .eq('warehouse_id', this.warehouseId)
        .eq('client_id', returnItem.client_id)
        .single();

      if (invError) throw invError;

      const updates = { quantity: inv.quantity + returnItem.quantity };

      if (['NEW', 'OPENED'].includes(condition)) {
        updates.available_qty = inv.available_qty + returnItem.quantity;
      } else {
        updates.damaged_qty = (inv.damaged_qty || 0) + returnItem.quantity;
      }

      await this.supabase
        .from('warehouse_inventory')
        .update(updates)
        .eq('id', inv.id);

      // Create ledger entry
      await this.supabase
        .from('warehouse_ledger')
        .insert({
          warehouse_id: this.warehouseId,
          warehouse_product_id: returnItem.warehouse_product_id,
          client_id: returnItem.client_id,
          movement_type: 'IN',
          movement_subtype: 'RETURN',
          quantity: returnItem.quantity,
          notes: `Return approved - ID: ${returnItem.id}`,
          item_condition: condition,
          created_by: this.userId
        });
    } catch (error) {
      console.error('Error restocking inventory:', error);
      throw error;
    }
  }

  /**
   * Bulk delete returns
   */
  async bulkDelete(returnIds) {
    try {
      const { error } = await this.supabase
        .from('warehouse_return_requests')
        .delete()
        .in('id', returnIds)
        .eq('warehouse_id', this.warehouseId);

      if (error) throw error;

      // Audit log
      await this.createAuditLog({
        action: 'BULK_DELETE',
        details: { count: returnIds.length, ids: returnIds }
      });

      return true;
    } catch (error) {
      console.error('Error bulk deleting returns:', error);
      throw error;
    }
  }

  /**
   * Create audit log entry
   */
  async createAuditLog(logData) {
    try {
      await this.supabase
        .from('warehouse_audit_logs')
        .insert({
          warehouse_id: this.warehouseId,
          user_id: this.userId,
          action: logData.action,
          entity_type: 'return_request',
          entity_id: logData.return_id,
          details: logData.details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw - audit failures shouldn't block operations
    }
  }

  /**
   * Export returns data
   */
  async exportReturns(filters) {
    try {
      const { data } = await this.fetchReturns({
        ...filters,
        pageSize: 10000
      });

      return data;
    } catch (error) {
      console.error('Error exporting returns:', error);
      throw error;
    }
  }
}