// components/AttendantsTable/index.jsx
import React, { useState } from 'react';
import useAttendants from './useAttendants';
import EmployeesCard from './EmployeesCard';
import ViewAttendantModal from './ViewAttendantModal';
import AttendantFormModal from './AttendantFormModal';

import { ToastContainer } from 'react-toastify';

export default function AttendantsTable() {
  const ownerId = Number(localStorage.getItem('owner_id'));
  const { attendants, stores, loading, error, createAttendant, updateAttendant, deleteAttendant } = useAttendants(ownerId);

  const [viewDetails, setViewDetails] = useState(null);
  const [editAttendant, setEditAttendant] = useState(null);
  const [newAttendant, setNewAttendant] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Employees</h2>
     
      </div>

      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      {loading && <div className="text-center text-gray-500">Loading...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attendants.map(a => (
          <EmployeesCard
            key={a.id}
            attendant={a}
            onView={() => setViewDetails(a)}
            onEdit={() => setEditAttendant(a)}
            onDelete={() => deleteAttendant(a.id)}
          />
        ))}
      </div>

      {/* Modals */}
      {viewDetails && <ViewAttendantModal attendant={viewDetails} onClose={() => setViewDetails(null)} />}
      {newAttendant && <AttendantFormModal attendant={{}} stores={stores} onClose={() => setNewAttendant(false)} onSubmit={createAttendant} />}
      {editAttendant && <AttendantFormModal attendant={editAttendant} stores={stores} onClose={() => setEditAttendant(null)} onSubmit={updateAttendant} />}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}
