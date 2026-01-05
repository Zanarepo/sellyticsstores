// src/hooks/useScheduleManagement.js
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../../supabaseClient';
import toast from 'react-hot-toast';
import { parseISO, isBefore } from 'date-fns';

export default function useScheduleManagement() {
  const [storeId, setStoreId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filters
  const [filters, setFilters] = useState({
    name: '',
    dateStart: '',
    dateEnd: '',
    status: '',
  });

  // Fetch user role and store
  useEffect(() => {
    const initUser = async () => {
      try {
        const storedEmail = localStorage.getItem('user_email');
        if (!storedEmail) throw new Error('Please log in again.');

        setUserEmail(storedEmail);

        // Check if owner (admin)
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('email_address', storedEmail)
          .maybeSingle();

        if (store) {
          setIsAdmin(true);
          setStoreId(store.id);

          // Optional: get admin's store_users entry
          const { data: adminUser } = await supabase
            .from('store_users')
            .select('id')
            .eq('store_id', store.id)
            .eq('email_address', storedEmail)
            .maybeSingle();
          if (adminUser) setUserId(adminUser.id);
        } else {
          // Regular staff
          const { data: user } = await supabase
            .from('store_users')
            .select('id, store_id')
            .eq('email_address', storedEmail)
            .single();

          setIsStaff(true);
          setUserId(user.id);
          setStoreId(user.store_id);
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  // Fetch staff & schedules
  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      try {
        // Fetch staff
        const { data: staffData } = await supabase
          .from('store_users')
          .select('id, full_name, role')
          .eq('store_id', storeId);
        setStaff(staffData || []);

        // Fetch and filter schedules
        let query = supabase
          .from('schedules')
          .select('*, store_users!staff_id(full_name, role)')
          .eq('store_id', storeId);

        if (filters.name) query = query.ilike('store_users.full_name', `%${filters.name}%`);
        if (filters.dateStart) query = query.gte('start_date', filters.dateStart);
        if (filters.dateEnd) query = query.lte('end_date', filters.dateEnd);
        if (filters.status) query = query.eq('status', filters.status);

        const { data } = await query;
        if (!data) return;

        // Sort: active time-off → upcoming → expired → others
        const today = new Date();
        const sorted = data.sort((a, b) => {
          const aActive = ['TimeOffRequested', 'TimeOffApproved'].includes(a.status) && !isBefore(parseISO(a.end_date), today);
          const bActive = ['TimeOffRequested', 'TimeOffApproved'].includes(b.status) && !isBefore(parseISO(b.end_date), today);

          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          return 0;
        });

        setSchedules(sorted);
      } catch (err) {
        toast.error('Failed to load schedules');
        setError(err.message);
      }
    };

    fetchData();
  }, [storeId, filters]);




  const createOrUpdateSchedule = async (payload, isUpdate = false) => {
  // ALWAYS get storeId from localStorage as fallback
  const fallbackStoreId = localStorage.getItem('store_id');
  if (!fallbackStoreId) {
    throw new Error('Store ID not found. Please log in again.');
  }

  const finalPayload = {
    ...payload,
    store_id: payload.store_id || Number(fallbackStoreId), // ← CRITICAL FIX
  };

  const { data, error } = await supabase
    .from('schedules')
    .upsert([finalPayload], { 
      onConflict: ['store_id', 'staff_id', 'start_date', 'end_date'] 
    })
    .select('*, store_users!staff_id(full_name, role)')
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  setSchedules(prev => {
    const filtered = prev.filter(s => s.id !== data.id);
    return [...filtered, data];
  });

  return data;
};


  const deleteSchedule = async (id) => {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

const approveTimeOff = async (scheduleId) => {
  const storeId = localStorage.getItem('store_id');
  if (!storeId) throw new Error('Store ID missing');

  const { error } = await supabase
    .from('schedules')
    .update({ status: 'TimeOffApproved' })
    .eq('id', scheduleId)
    .eq('store_id', storeId);

  if (error) throw error;

  // Refresh schedules list
  setSchedules(prev => prev.map(s => 
    s.id === scheduleId ? { ...s, status: 'TimeOffApproved' } : s
  ));
};

const rejectTimeOff = async (scheduleId) => {
  const storeId = localStorage.getItem('store_id');
  if (!storeId) throw new Error('Store ID missing');

  const { error } = await supabase
    .from('schedules')
    .update({ status: 'TimeOffRejected' })
    .eq('id', scheduleId)
    .eq('store_id', storeId);

  if (error) throw error;

  setSchedules(prev => prev.map(s => 
    s.id === scheduleId ? { ...s, status: 'TimeOffRejected' } : s
  ));
};



const { activeSchedules, archivedSchedules } = useMemo(() => {
  const today = new Date();

  const active = [];
  const archived = [];

  schedules.forEach(schedule => {
    const endDate = parseISO(schedule.end_date);
    const isExpired = isBefore(endDate, today);

    // Archive only completed/expired time-off (Approved/Rejected/Off)
    if (isExpired && ['TimeOffApproved', 'TimeOffRejected', 'Off'].includes(schedule.status)) {
      archived.push(schedule);
    } else {
      active.push(schedule);
    }
  });

  // Sort both: newest first
  active.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  archived.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));

  return { activeSchedules: active, archivedSchedules: archived };
}, [schedules]);











  return {
    storeId,
    userId,
    userEmail,
    schedules,
    staff,
    isAdmin,
    isStaff,
    loading,
    error,
    approveTimeOff,
  rejectTimeOff,
    filters,
    setFilters,
    createOrUpdateSchedule,
    deleteSchedule,
    activeSchedules,
  archivedSchedules,
  };
}