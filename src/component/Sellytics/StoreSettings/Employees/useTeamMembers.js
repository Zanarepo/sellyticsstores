import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';

export function useTeamMembers(notify) {
  const [members, setMembers] = useState([]);
  const storeId = localStorage.getItem('store_id');

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('store_users')
      .select('*')
      .eq('store_id', storeId);

    if (error) notify('Failed to load team members', 'error');
    else setMembers(data);
  }, [storeId, notify]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const removeMember = async (id) => {
    await supabase.from('store_users').delete().eq('id', id);
    notify('Member removed');
    fetchMembers();
  };

  const suspendMember = async (id, suspended) => {
    await supabase
      .from('store_users')
      .update({ role: suspended ? 'attendant' : 'suspended' })
      .eq('id', id);

    notify(suspended ? 'Member activated' : 'Member suspended');
    fetchMembers();
  };

  return { members, removeMember, suspendMember };
}
