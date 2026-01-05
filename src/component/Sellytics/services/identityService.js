/**
 * SwiftCheckout - Identity Service
 * Handles user authentication and permissions from localStorage
 * @version 1.0.0
 */

/**
 * Get current user identity from localStorage
 * @returns {Object} Identity object with userId, storeId, email, and validation flags
 */
export const getIdentity = () => {
  const rawUserId = localStorage.getItem('user_id');
  const rawStoreId = localStorage.getItem('store_id');
  const rawEmail = localStorage.getItem('user_email');
  
  const currentUserId = rawUserId ? Number(rawUserId) : null;
  const currentStoreId = rawStoreId ? Number(rawStoreId) : null;
  const currentUserEmail = rawEmail ? rawEmail.trim().toLowerCase() : null;
  
  return {
    currentUserId: isNaN(currentUserId) ? null : currentUserId,
    currentStoreId: isNaN(currentStoreId) ? null : currentStoreId,
    currentUserEmail,
    isValid: currentStoreId !== null && !isNaN(currentStoreId),
    hasUser: currentUserId !== null && !isNaN(currentUserId)
  };
};

/**
 * Get creator metadata for new records
 * @returns {Object} Creator fields for database records
 */
export const getCreatorMetadata = () => {
  const { currentUserId, currentStoreId, currentUserEmail } = getIdentity();
  
  return {
    created_by_user_id: currentUserId,
    created_by_stores: currentStoreId,
    created_by_email: currentUserEmail,
    owner_id: currentStoreId
  };
};

/**
 * Check if current user can view a sale
 * @param {Object} sale - Sale record
 * @param {boolean} isOwner - Whether current user is store owner
 * @returns {boolean}
 */
export const canViewSale = (sale, isOwner) => {
  if (isOwner) return true;
  
  const { currentUserId } = getIdentity();
  return sale?.created_by_user_id === currentUserId;
};

/**
 * Check if current user can edit a sale
 * @param {Object} sale - Sale record
 * @param {boolean} isOwner - Whether current user is store owner
 * @returns {boolean}
 */
export const canEditSale = (sale, isOwner) => {
  // Only unsynced sales can be edited by their creator
  if (!sale?._synced) {
    const { currentUserId } = getIdentity();
    return sale?.created_by_user_id === currentUserId;
  }
  
  // Synced sales can only be edited by owner
  return isOwner;
};

/**
 * Check if current user can delete a sale
 * @param {Object} sale - Sale record
 * @param {boolean} isOwner - Whether current user is store owner
 * @returns {boolean}
 */
export const canDeleteSale = (sale, isOwner) => {
  // Unsynced sales can be deleted by their creator
  if (!sale?._synced) {
    const { currentUserId } = getIdentity();
    return sale?.created_by_user_id === currentUserId;
  }
  
  // Synced sales can only be deleted by owner
  return isOwner;
};

/**
 * Filter sales based on user permissions
 * @param {Array} sales - Array of sale records
 * @param {boolean} isOwner - Whether current user is store owner
 * @returns {Array} Filtered sales
 */
export const filterSalesByPermission = (sales = [], isOwner) => {
  if (isOwner) return sales;
  
  const { currentUserId } = getIdentity();
  return sales.filter(s => s?.created_by_user_id === currentUserId);
};

/**
 * Filter sales by store
 * @param {Array} sales - Array of sale records
 * @param {number|string} storeId - Store ID to filter by
 * @returns {Array} Filtered sales
 */
export const filterSalesByStore = (sales = [], storeId) => {
  const sid = Number(storeId);
  if (isNaN(sid)) return [];
  return sales.filter(s => s?.store_id === sid);
};

/**
 * Filter sales by creator
 * @param {Array} sales - Array of sale records
 * @param {number|string} userId - User ID to filter by
 * @returns {Array} Filtered sales
 */
export const filterSalesByCreator = (sales = [], userId) => {
  const uid = Number(userId);
  if (isNaN(uid)) return [];
  return sales.filter(s => s?.created_by_user_id === uid);
};

// Fixed: Named object export - ESLint compliant
const IdentityService = {
  getIdentity,
  getCreatorMetadata,
  canViewSale,
  canEditSale,
  canDeleteSale,
  filterSalesByPermission,
  filterSalesByStore,
  filterSalesByCreator
};

export default IdentityService;