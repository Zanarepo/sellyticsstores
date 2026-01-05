// TeamManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [notification, setNotification] = useState('');
  const storeId = localStorage.getItem('store_id');

  const fetchTeamMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('store_users')
      .select('id, full_name, email_address, phone_number, role')
      .eq('store_id', storeId);

    if (error) {
      console.error('Error fetching team members:', error.message);
      setNotification('Error retrieving team members.');
    } else {
      setTeamMembers(data || []);
    }
  }, [storeId]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-indigo-800 dark:text-white mb-6">
        Team Management
      </h2>

      {notification && (
        <div className="mb-4 p-2 text-green-600">
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.02 }}
              className="relative p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {member.full_name?.[0] || '?'}
                </span>
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                  {member.full_name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {member.email_address}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Phone: {member.phone_number || 'N/A'}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Role:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {member.role}
                  </span>
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamManagement;
