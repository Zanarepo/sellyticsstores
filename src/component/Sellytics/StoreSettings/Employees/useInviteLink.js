// src/component/Sellytics/StoreSettings/Employees/hooks/useInviteLink.js
import { useState } from 'react';
import { supabase } from '../../../../supabaseClient';

export function useInviteLink(notify) { // <-- renamed from useInviteLsink
  const [inviteLink, setInviteLink] = useState('');
  const storeId = localStorage.getItem('store_id');

  const generateInvite = async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('shop_name')
      .eq('id', storeId)
      .single();

    if (error) return notify('Failed to generate invite', 'error');

    const link = `${window.location.origin}/team-signup?store_id=${storeId}&shop_name=${encodeURIComponent(data.shop_name)}`;
    setInviteLink(link);
    notify('Invite link generated');
  };

  return { inviteLink, generateInvite };
}
