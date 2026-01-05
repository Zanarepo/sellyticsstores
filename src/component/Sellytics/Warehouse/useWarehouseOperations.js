import { toast } from 'react-hot-toast';
import { useWarehouseMutations } from './useWarehouseMutations';

export function useWarehouseOperations(warehouseId, inventory) {
  const {
    createLedgerEntry,
    createInventory,
    updateInventory,
    createSerialItem,
    queryClient
  } = useWarehouseMutations();

  const handleIntake = async (intakeData) => {
    try {
      for (const item of intakeData.items) {
        const product = item.product;
        if (!product) continue;

        await createLedgerEntry.mutateAsync({
          warehouse_id: warehouseId,
          warehouse_product_id: product.id,
          client_id: intakeData.client_id,
          movement_type: 'IN',
          movement_subtype: 'STANDARD',
          direction: 'IN',
          quantity: item.quantity,
          item_condition: 'GOOD',
          unique_identifiers: item.serial_numbers || [],
          notes: intakeData.notes
        });

        const existingInv = inventory.find(i => i.warehouse_product_id === product.id);
        if (existingInv) {
          await updateInventory.mutateAsync({
            id: existingInv.id,
            data: {
              quantity: (existingInv.quantity || 0) + item.quantity,
              available_qty: (existingInv.available_qty || 0) + item.quantity
            }
          });
        } else {
          await createInventory.mutateAsync({
            warehouse_product_id: product.id,
            quantity: item.quantity,
            available_qty: item.quantity,
            damaged_qty: 0
          });
        }

        if (item.serial_numbers?.length > 0) {
          for (const serial of item.serial_numbers) {
            await createSerialItem.mutateAsync({
              warehouse_product_id: product.id,
              serial_number: serial,
              status: 'IN_STOCK'
            });
          }
        }
      }

      await queryClient.invalidateQueries(['warehouse-inventory']);
      await queryClient.invalidateQueries(['warehouse-ledger']);
      
      const totalItems = intakeData.items.reduce((sum, i) => sum + i.quantity, 0);
      toast.success(`Stock intake completed: ${totalItems} items received`);
      
      return true;
    } catch (error) {
      toast.error('Failed to process intake');
      return false;
    }
  };

  const handleDispatch = async (dispatchData) => {
    try {
      for (const item of dispatchData.items) {
        const product = item.product || item.inventory?.product;
        if (!product) continue;

        await createLedgerEntry.mutateAsync({
          warehouse_id: warehouseId,
          warehouse_product_id: product.id,
          client_id: dispatchData.client_id,
          movement_type: 'OUT',
          movement_subtype: 'STANDARD',
          direction: 'OUT',
          quantity: item.quantity,
          item_condition: 'GOOD',
          unique_identifiers: item.serial_numbers || [],
          notes: dispatchData.notes
        });

        const existingInv = inventory.find(i => i.warehouse_product_id === product.id);
        if (existingInv) {
          await updateInventory.mutateAsync({
            id: existingInv.id,
            data: {
              quantity: Math.max(0, (existingInv.quantity || 0) - item.quantity),
              available_qty: Math.max(0, (existingInv.available_qty || 0) - item.quantity)
            }
          });
        }
      }

      await queryClient.invalidateQueries(['warehouse-inventory']);
      await queryClient.invalidateQueries(['warehouse-ledger']);
      
      const totalItems = dispatchData.items.reduce((sum, i) => sum + i.quantity, 0);
      toast.success(`Stock dispatched: ${totalItems} items sent`);
      
      return true;
    } catch (error) {
      toast.error('Failed to process dispatch');
      return false;
    }
  };

  return {
    handleIntake,
    handleDispatch,
    isLoading: createLedgerEntry.isPending
  };
}