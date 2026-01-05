/**
 * SwiftCheckout - Entry Point
 * Production-grade offline-first inventory + sales POS system
 * 
 * Usage:
 *   import SwiftCheckout from './components/SwiftCheckout';
 *   <SwiftCheckout />
 * 
 * Required localStorage keys:
 *   - user_id: Current user ID (number)
 *   - store_id: Current store ID (number)
 *   - user_email: Current user email (string)
 * 
 * Required Supabase client:
 *   - Must have ../supabaseClient exporting { supabase }
 * 
 * Features:
 *   - Barcode scanning (camera + external scanner)
 *   - Offline-first with IndexedDB (Dexie)
 *   - Smart device ID tracking and deduplication
 *   - Inventory checks with low stock alerts
 *   - Automatic sync with pause/resume/clear
 *   - Role-based permissions (owner vs user)
 *   - Sales history with filters
 *   - Product performance analytics
 *   - Real-time notifications
 * 
 * @version 2.0.0
 */

import Tracker from './Tracker';

export default Tracker;

// Also export individual components for customization
export { default as Tracker } from './Tracker';
export { default as ScannerModal } from './components/ScannerModal';
export { default as CheckoutForm } from './components/CheckoutForm';
export { default as PendingSalesList } from './components/PendingSalesList';
export { default as SalesHistory } from './components/SalesHistory';
export { default as NotificationsPanel, NotificationBadge } from './components/NotificationsPanel';
export { default as ProductPerformanceModal } from './components/ProductPerformanceModal';
export { default as ViewSaleModal } from './components/ViewSaleModal';
export { default as EditSaleModal } from './components/EditSaleModal';
export { default as CustomDropdown, DropdownItem, DropdownSeparator } from './components/CustomDropdown';

// Export hooks
export { default as useScanner } from './hooks/useScanner';
export { default as useOfflineSync } from './hooks/useOfflineSync';
export { default as useCheckoutState } from './hooks/useCheckoutState';
export { default as useDataLoader } from './hooks/useDataLoader';

// Export services
export { default as salesService } from './services/salesService';
export { default as identityService } from './services/identityService';

// Export offline cache
export { default as offlineCache } from './db/offlineCache';
export { default as db } from './db/dexieDb';