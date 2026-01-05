import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, WifiOff } from 'lucide-react';
import TeamActionsMenu from './TeamActionsMenu';

const TeamMemberCard = forwardRef(function TeamMemberCard(
  { member, index, onRemove, onSuspend, isPending = false, isOffline = false },
  ref
) {
  const [ setShowMenu] = useState(false);

  const handleSuspend = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onSuspend(member.id, member.role === 'suspended');
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm(`Remove "${member.full_name}" from the team?`)) {
      onRemove(member.id);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02 }}
      className="relative p-4 w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-start cursor-pointer hover:shadow-lg"
    >
      {/* Pending badge */}
      {isPending && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </div>
      )}

      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Avatar/Icon */}
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
            Role: <span className="font-medium">{member.role}</span>
          </p>
        </div>
      </div>

      {/* Actions menu */}
      <TeamActionsMenu
        suspended={member.role === 'suspended'}
        onRemove={handleRemove}
        onSuspend={handleSuspend}
      />

      {/* Offline indicator */}
      {isOffline && (
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
          <WifiOff className="w-3 h-3 text-white" />
        </div>
      )}
    </motion.div>
  );
});

export default TeamMemberCard;
