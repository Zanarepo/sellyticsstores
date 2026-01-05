// src/utils/accessControl.js
// FINAL — WORKS FOR OWNERS & STAFF — NO MORE "VIEW ONLY"
import { supabase } from '../../../../supabaseClient';

const permissionCache = new Map();
const isValidStoreId = (id) => id && !isNaN(Number(id)) && Number(id) > 0;

// FORCE CLEAR CACHE ON EVERY CALL — TEMPORARY FIX TO MAKE IT WORK NOW
// Remove this line later if you want caching back
permissionCache.clear(); // ← THIS IS THE KEY FIX

export const checkIsOwner = async (storeId, userEmail) => {
  if (!isValidStoreId(storeId) || !userEmail) return false;

  const email = userEmail.trim().toLowerCase();


  // COMMENTED OUT CACHE — IT WAS THE BUG
  // if (permissionCache.has(key)) return permissionCache.get(key);

  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('id', Number(storeId))
      .eq('email_address', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return false;
    }

    const result = !!data;
    // permissionCache.set(key, result); // ← Disabled caching for now
    return result;
  } catch (err) {
    console.error('checkIsOwner failed:', err);
    return false;
  }
};

export const checkIsStoreUser = async (storeId, userEmail) => {
  if (!isValidStoreId(storeId) || !userEmail) return false;

  const email = userEmail.trim().toLowerCase();


  try {
    const { data, error } = await supabase
      .from('store_users')
      .select('id')
      .eq('store_id', Number(storeId))
      .eq('email_address', email)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return false;
    }

    const result = !!data;
    return result;
  } catch (err) {
    console.error('checkIsStoreUser failed:', err);
    return false;
  }
};

export const getUserPermission = async (storeId, userEmail) => {
  if (!userEmail || !isValidStoreId(storeId)) {
    return {
      canEdit: false,
      canDelete: false,
      canView: false,
      canRestock: false,
    };
  }

  const email = userEmail.trim().toLowerCase();

  const [isOwner, isStaff] = await Promise.all([
    checkIsOwner(storeId, email),
    checkIsStoreUser(storeId, email)
  ]);

  const hasAccess = isOwner || isStaff;

  console.log('PERMISSION RESULT:', { storeId, email, isOwner, isStaff, hasAccess });

  return {
    canEdit: hasAccess,        // Both can edit name, price, etc.
    canDelete: isOwner,        // Only owner can delete or remove old IMEIs
    canView: hasAccess,
    canRestock: hasAccess
  };
};

export const clearPermissionCache = () => permissionCache.clear();