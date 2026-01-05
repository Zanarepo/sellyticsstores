// src/components/dashboard/ErrorAlert.jsx
import React from 'react';
import { FaLock, FaTimes } from 'react-icons/fa';

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
            <FaLock className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">Access Restricted</h4>
            <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;