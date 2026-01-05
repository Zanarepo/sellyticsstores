
// useUserPermissions.js
import { useState, useCallback, useEffect } from 'react';
import { getUserPermission } from '../utils/accessControl';

export function useUserPermissions(storeId, isOnline) {
  const [userPermissions, setUserPermissions] = useState({
    canEdit: true, canDelete: true, canView: true, canRestock: true
  });

  const loadUserPermissions = useCallback(async () => {
    if (!isOnline || !storeId) {
      setUserPermissions({ canEdit: true, canDelete: true, canView: true, canRestock: true });
      return;
    }

    try {
      const userEmail = localStorage.getItem('user_email');
      if (!userEmail) return setUserPermissions({ canEdit: false, canDelete: false, canView: false, canRestock: false });

      const permissions = await getUserPermission(storeId, userEmail);
      setUserPermissions(permissions);
    } catch {
      setUserPermissions({ canEdit: false, canDelete: false, canView: false, canRestock: false });
    }
  }, [isOnline, storeId]);

  useEffect(() => { loadUserPermissions(); }, [loadUserPermissions]);

  return { userPermissions, loadUserPermissions };
}
