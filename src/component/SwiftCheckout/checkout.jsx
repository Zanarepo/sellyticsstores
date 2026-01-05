
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import main tracker component
import SalesTracker from './Swift';

// Re-export all components for granular usage
export { default as SalesTracker } from './Tracker';
export { default as CheckoutForm } from '../SwiftCheckout/CheckoutForm';
export { default as ScannerModal } from '../SwiftCheckout/ScannerModal';
export { default as SyncControls } from '../SwiftCheckout/SyncControls';
export { default as ProductPerformanceModal } from '../SwiftCheckout/ProductPerformanceModal';
export { default as SalesTable } from '../SwiftCheckout/SalesTable';
export { default as SalesHeader } from '../SwiftCheckout/SalesHeader';
export { default as SalesForm } from '../SwiftCheckout/SalesForm';
export { default as CustomerSelector } from '../SwiftCheckout/CustomerSelector';
export { default as DeviceDetailModal } from '../SwiftCheckout/DeviceDetailModal';
export { default as ExportButtons } from '../SwiftCheckout/ExportButtons';
export { default as SalesPagination } from '../SwiftCheckout/SalesPagination';
export { SalesLineRow, SalesLineCard, EmptyLinesPlaceholder } from '../SwiftCheckout/SalesLineRow';

// Re-export all hooks
export { default as useSalesForm } from '../SwiftCheckout/hooks/useSalesForm';
export { default as useScanner } from '../SwiftCheckout/hooks/useScanner';
export { default as useOfflineCache } from '../SwiftCheckout/hooks/useOfflineCache';
export { default as useSalesData } from '../SwiftCheckout/hooks/useSalesData';
export { default as useMultiStore } from '../SwiftCheckout/hooks/useMultiStore';
export { default as useSalesCrud } from '../SwiftCheckout/hooks/useSalesCrud';
export { default as useDeviceValidation } from '../SwiftCheckout/hooks/useDeviceValidation';
export { default as useDeviceLineHandler } from '../SwiftCheckout/hooks/useDeviceLineHandler';
export { default as useSalesPagination } from '../SwiftCheckout/hooks/useSalesPagination';
export { default as useScanHandler } from '../SwiftCheckout/hooks/useScanHandler';
export { default as useSaleFormHandlers } from '../SwiftCheckout/hooks/useSaleFormHandlers';
export { default as useModalHandlers } from '../SwiftCheckout/hooks/useModalHandlers';
export { default as useCurrency } from '../SwiftCheckout/hooks/useCurrency';

// Re-export all services
export * from '../SwiftCheckout/services/salesServices';
export * from '../SwiftCheckout/services/syncServices';

// Re-export all utilities
export * from '../SwiftCheckout/utils/identity';
export * from '../SwiftCheckout/utils/validation';
export * from '../SwiftCheckout/utils/formatting';
export * from '../SwiftCheckout/utils/deviceValidation';

// Re-export UI components
export { default as CustomDropdown, DropdownItem, DropdownSeparator } from '../SwiftCheckout/CustomDropdown';

// Re-export database utilities
export * from '../SwiftCheckout/db/offlineDb';



export default function SwiftCheckout({ onSaleComplete }) {
  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <SalesTracker onSaleComplete={onSaleComplete} />
    </>
  );
}

/**
 * SwiftCheckout Module Info
 */
SwiftCheckout.displayName = 'SwiftCheckout';
SwiftCheckout.version = '1.0.0';
SwiftCheckout.description = 'Enterprise-grade offline-first sales tracker with scanning, inventory, multi-store, and sync capabilities';