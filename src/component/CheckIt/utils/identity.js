import { toast } from 'react-toastify';

/**
 * Get current user info from localStorage
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return { userId: null, storeId: null, userEmail: null };

  const userId = Number(localStorage.getItem('user_id')) || null;
  const storeId = Number(localStorage.getItem('store_id')) || null;
  const userEmail = localStorage.getItem('user_email')?.trim().toLowerCase() || null;

  return { userId, storeId, userEmail };
}

/**
 * Get creator metadata for records (sale lines/groups)
 */
export function getCreatorMetadata() {
  const { userId, storeId, userEmail } = getCurrentUser();
  return {
    created_by_user_id: userId,
    created_by_stores: storeId,
    created_by_email: userEmail
  };
}

/**
 * Validate store ID
 */
export function validateStoreId(storeId) {
  const numericId = Number(storeId);
  if (!numericId || numericId <= 0) {
    toast.error('Invalid store configuration');
    return null;
  }
  return numericId;
}

/**
 * Generate unique client reference (for offline sales)
 */
export function generateClientRef() {
  return crypto.randomUUID();
}

/**
 * Handle sync errors gracefully
 */
export function handleSyncError(error) {
  console.error('Sync error:', error);
  toast.error(`Sync error: ${error.message || error}`);
}
