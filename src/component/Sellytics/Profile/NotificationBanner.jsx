// src/components/store-owner/NotificationBanner.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const NotificationBanner = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300',
    error: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300',
  };

  return (
    <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-2xl shadow-lg border-l-4 ${styles[type]} flex items-center justify-between`}>
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
        <FaTimes className="text-lg" />
      </button>
    </div>
  );
};

export default NotificationBanner;