// hooks/useAttendance.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';
import { parseISO, startOfDay,  differenceInHours, addDays, format} from 'date-fns';

export function useAttendance() {
  const [storeId, setStoreId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats] = useState({});

  const userEmail = localStorage.getItem('user_email');

const [, setStoreShiftHours] = useState(() => {
  const saved = localStorage.getItem('store_shift_hours');
  return saved ? parseFloat(saved) : 8; // default 8 hours
});

// Add function to update it (admin only)
const updateStoreShiftHours = (hours) => {
  if (!isAdmin) return;
  localStorage.setItem('store_shift_hours', hours.toString());
  setStoreShiftHours(hours);
  toast.success(`Standard shift set to ${hours} hours`);
};




  // Fetch user and store data
  const fetchUserData = useCallback(async () => {
    if (!userEmail) {
      setError('Please log in.');
      setLoading(false);
      return;
    }

    try {
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('email_address', userEmail)
        .maybeSingle();

      if (storeData) {
        setIsAdmin(true);
        setStoreId(storeData.id);
        const { data: existingUser } = await supabase
          .from('store_users')
          .select('id')
          .eq('email_address', userEmail)
          .eq('store_id', storeData.id)
          .maybeSingle();
        if (existingUser) setUserId(existingUser.id);
      } else {
        const { data: uData } = await supabase
          .from('store_users')
          .select('id, store_id')
          .eq('email_address', userEmail)
          .maybeSingle();
        if (!uData) throw new Error('User not found.');
        setUserId(uData.id);
        setStoreId(uData.store_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Fetch attendance logs
  const fetchLogs = useCallback(async () => {
    if (!storeId) return;

    try {
      let query = supabase
        .from('attendance')
        .select('id, user_id, action, timestamp, store_users!user_id(full_name)')
        .eq('store_id', storeId)
        .order('timestamp', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data } = await query;
      setAttendanceLogs(data || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load logs');
    }
  }, [storeId, isAdmin, userId]);

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    if (!storeId) return;

    try {
      let query = supabase
        .from('permissions')
        .select('*')
        .eq('store_id', storeId)
        .order('start_date', { ascending: false });

      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data } = await query;
      setPermissions(data || []);
    } catch (err) {
      toast.error('Failed to load permissions');
    }
  }, [storeId, isAdmin, userId]);

  // Fetch users for admin
  const fetchUsers = useCallback(async () => {
    if (!storeId || !isAdmin) return;

    try {
      const { data } = await supabase
        .from('store_users')
        .select('id, full_name, email_address')
        .eq('store_id', storeId);
      setUsers(data || []);
    } catch (err) {
      toast.error('Failed to load users');
    }
  }, [storeId, isAdmin]);

  // Calculate stats

 // hooks/useAttendance.js (updated calculateStats with admin shift logic)

const calculateStats = useCallback((logs, permissions = [], filteredUserId = null) => {
  const userLogs = filteredUserId 
    ? logs.filter(l => l.user_id === filteredUserId)
    : logs;

  if (userLogs.length === 0) {
    return {
      totalClockIns: 0,
      totalClockOuts: 0,
      completeAttendances: 0,
      incompleteAttendances: 0,
      absences: 0,
      totalHours: '0.0',
      averageShiftHours: '0.0',
      overtime: '0.0',
      deficit: '0.0',
      storeShiftHours: 8
    };
  }

  const sortedLogs = [...userLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Group logs by day
  const logsByDay = {};
  sortedLogs.forEach(log => {
    const dayKey = format(parseISO(log.timestamp), 'yyyy-MM-dd');
    if (!logsByDay[dayKey]) logsByDay[dayKey] = [];
    logsByDay[dayKey].push(log);
  });

  // Admin-set expected shift length
  const storedShift = localStorage.getItem('store_shift_hours');
  const storeShiftHours = storedShift ? parseFloat(storedShift) : 8;

  // Approved leave dates
  const approvedLeaves = new Set(
    permissions
      .filter(p => p.status === 'approved')
      .flatMap(p => {
        const dates = [];
        let current = new Date(p.start_date);
        const end = new Date(p.end_date);
        while (current <= end) {
          dates.push(format(current, 'yyyy-MM-dd'));
          current = addDays(current, 1);
        }
        return dates;
      })
  );

  let complete = 0;
  let incomplete = 0;
  let totalHours = 0;
  let attendedDays = 0;
  let overtime = 0;
  let deficit = 0;

  // Single loop: process each day
  Object.values(logsByDay).forEach(dayLogs => {
    const clockIn = dayLogs.find(l => l.action === 'clock-in');
    const clockOut = dayLogs.find(l => l.action === 'clock-out');

    if (clockIn && clockOut) {
      // Complete day
      complete++;
      attendedDays++;

      let actualHours = differenceInHours(parseISO(clockOut.timestamp), parseISO(clockIn.timestamp));
      // Sanitize unrealistic values
      if (actualHours <= 0 || actualHours >= 24) {
        actualHours = storeShiftHours;
      }

      totalHours += actualHours;

      // Calculate overtime/deficit
      const diff = actualHours - storeShiftHours;
      if (diff > 0) {
        overtime += diff;
      } else if (diff < 0) {
        deficit += Math.abs(diff);
      }
    } else if (clockIn) {
      // Incomplete day — assume full shift
      incomplete++;
      attendedDays++;
      totalHours += storeShiftHours;
      // No overtime/deficit for incomplete days (fair assumption)
    }
  });

  // Absences calculation
  const firstLogDate = parseISO(sortedLogs[0].timestamp);
  const today = new Date();
  let current = startOfDay(firstLogDate);
  let absences = 0;

  while (current <= today) {
    const dayStr = format(current, 'yyyy-MM-dd');
    const weekday = current.getDay();
    if (weekday >= 1 && weekday <= 5) { // Mon–Fri
      if (!logsByDay[dayStr] && !approvedLeaves.has(dayStr)) {
        absences++;
      }
    }
    current = addDays(current, 1);
  }

  const averageShift = attendedDays > 0 
    ? (totalHours / attendedDays).toFixed(1)
    : '0.0';

  return {
    totalClockIns: userLogs.filter(l => l.action === 'clock-in').length,
    totalClockOuts: userLogs.filter(l => l.action === 'clock-out').length,
    completeAttendances: complete,
    incompleteAttendances: incomplete,
    absences,
    totalHours: totalHours.toFixed(1),
    averageShiftHours: averageShift,
    overtime: overtime.toFixed(1),
    deficit: deficit.toFixed(1),
    storeShiftHours
  };
}, []);





  // Clock in/out
  const clockInOut = async (scannedCode) => {
    // Your scan logic here, using toast for messages
    toast.success('Clocked in successfully');
    await fetchLogs();
  };

  // Request permission
  const requestPermission = async (data) => {
    try {
      await supabase.from('permissions').insert([{ ...data, user_id: userId, store_id: storeId, status: 'pending' }]);
      toast.success('Permission requested');
      await fetchPermissions();
    } catch (err) {
      toast.error('Failed to request permission');
    }
  };

  // Approve permission
  const approvePermission = async (permId, status) => {
    if (!isAdmin) return;
    try {
      await supabase.from('permissions').update({ status }).eq('id', permId);
      toast.success(`Permission ${status}`);
      await fetchPermissions();
    } catch (err) {
      toast.error('Failed to update permission');
    }
  };

  // Delete logs (multiple)
  const deleteLogs = async (logIds) => {
    if (!isAdmin) return;
    try {
      await supabase.from('attendance').delete().in('id', logIds);
      toast.success('Logs deleted');
      await fetchLogs();
    } catch (err) {
      toast.error('Failed to delete logs');
    }
  };

  // Clear all logs
  const clearAll = async () => {
    if (!isAdmin) return;
    try {
      await supabase.from('attendance').delete().eq('store_id', storeId);
      toast.success('All logs cleared');
      await fetchLogs();
    } catch (err) {
      toast.error('Failed to clear logs');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (storeId) {
      fetchLogs();
      fetchPermissions();
      fetchUsers();
    }
  }, [storeId, fetchLogs, fetchPermissions, fetchUsers]);

  return {
    loading,
    error,
    isAdmin,
    logs: attendanceLogs,
    permissions,
    users,
    stats,
    calculateStats, // Call this with filters to get dynamic stats
    clockInOut,
    requestPermission,
    approvePermission,
    deleteLogs,

    clearAll,
    updateStoreShiftHours,
    storeShiftHours: parseFloat(localStorage.getItem('store_shift_hours') || '8'),
    

  };
}