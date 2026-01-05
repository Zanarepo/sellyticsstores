// components/attendance/PermissionModal.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function PermissionModal({ isOpen, onClose, onSubmit, isAdmin, permissions, onApprove }) {
  if (!isOpen) return null;

  return (
    <motion.div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Permissions</h2>
        {isAdmin ? (
          <div>
            {permissions.map(p => (
              <div key={p.id} className="mb-4">
                <p>{p.reason} from {p.start_date} to {p.end_date}</p>
                {p.status === 'pending' && (
                  <button onClick={() => onApprove(p.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded">
                    Approve
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <input type="date" name="start_date" required className="block w-full mb-2" />
            <input type="date" name="end_date" required className="block w-full mb-2" />
            <textarea name="reason" placeholder="Reason" required className="block w-full mb-4" />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Request</button>
          </form>
        )}
        <button onClick={onClose} className="mt-4 text-slate-600">Close</button>
      </motion.div>
    </motion.div>
  );
}