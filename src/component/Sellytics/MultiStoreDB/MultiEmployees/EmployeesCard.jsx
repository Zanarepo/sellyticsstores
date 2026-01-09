// components/AttendantCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';

export default function AttendantCard({ attendant, onView, onEdit, onDelete }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (actionFn) => {
    actionFn();          // call the action (View/Edit/Delete)
    setDropdownOpen(false); // close the dropdown
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex flex-col justify-between relative">
      <div className="space-y-1">
        <p className="text-sm font-semibold truncate">{attendant.full_name || 'N/A'}</p>
        <p className="text-xs text-gray-500 truncate">{attendant.phone_number || 'N/A'}</p>
        <p className="text-xs text-gray-500 truncate">{attendant.email_address || 'N/A'}</p>
        <p className="text-xs text-indigo-600 font-medium">{attendant.shop_name}</p>
      </div>

      <div className="absolute top-2 right-2" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical size={16} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 shadow-lg rounded border border-gray-200 dark:border-gray-600 z-10">
            <button
              onClick={() => handleAction(onView)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
            >
              <Eye size={14} className="mr-2" /> View
            </button>
            <button
              onClick={() => handleAction(onEdit)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
            >
              <Edit size={14} className="mr-2" /> Edit
            </button>
            <button
              onClick={() => handleAction(onDelete)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center text-red-500"
            >
              <Trash2 size={14} className="mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
