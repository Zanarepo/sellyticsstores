import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-11/12 max-w-md p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
