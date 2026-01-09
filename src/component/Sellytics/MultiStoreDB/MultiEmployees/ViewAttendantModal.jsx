// components/ViewAttendantModal.jsx
import React from 'react';

export default function ViewAttendantModal({ attendant, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Details for {attendant.full_name}</h3>
        <div className="space-y-2">
          {Object.entries({
            'Full Name': attendant.full_name,
            'Phone': attendant.phone_number,
            'Email': attendant.email_address,
            'Role': attendant.role || 'N/A',
            'Store': attendant.shop_name
          }).map(([label, value]) => (
            <div className="flex justify-between text-sm" key={label}>
              <span className="font-medium text-gray-700">{label}</span>
              <span className="text-gray-900">{value}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
