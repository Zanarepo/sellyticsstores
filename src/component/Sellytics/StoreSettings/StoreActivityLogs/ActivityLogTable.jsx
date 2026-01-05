import React, { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import LogDetailsModal from './LogDetailsModal';

export default function ActivityLogTable({ logs, loading, canDelete, handleDelete }) {
  const [viewDetails, setViewDetails] = useState(null);

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-indigo-600 text-white">
          <tr>
            {['ID','Source','Activity','Product','Details','Time','Actions'].map(h => (
              <th key={h} className="px-4 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {loading ? (
            <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
          ) : logs.length === 0 ? (
            <tr><td colSpan={7} className="text-center py-4">No logs</td></tr>
          ) : logs.map(log => (
            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-2">{log.id}</td>
              <td className="px-4 py-2">{log.log_source === 'product_logs' ? 'Product' : 'Sale'}</td>
              <td className="px-4 py-2">{log.activity_type}</td>
              <td className="px-4 py-2">{log.dynamic_product?.name || '—'}</td>
              <td className="px-4 py-2">
                <button onClick={() => setViewDetails(log)} className="text-indigo-600 flex items-center gap-1">
                  <Eye size={16} /> View
                </button>
              </td>
              <td className="px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
              <td className="px-4 py-2">
                <button
                  disabled={!canDelete}
                  onClick={() => handleDelete(log.id, log.log_source)}
                  className={`p-1 rounded ${canDelete ? 'text-red-500' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewDetails && (
        <LogDetailsModal log={viewDetails} onClose={() => setViewDetails(null)} />
      )}
    </div>
  );
}
