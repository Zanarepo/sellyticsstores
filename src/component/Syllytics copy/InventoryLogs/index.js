/**
 * SwiftInventory - Enterprise Inventory Management Module
 * Entry point for the inventory system
 * 
 * Usage:
 * import InventoryManager from './components/InventoryManager';
 * <InventoryManager />
 */
import InventoryTracker from './InventoryTracker';

export default function InventoryManager() {
  return <InventoryTracker />;
}

// Also export individual components for flexibility
export { default as InventoryTracker } from './InventoryTracker';