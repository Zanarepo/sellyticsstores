// Explanations.jsx
import { useState } from 'react';
import { Info } from 'lucide-react';

export default function Explanations() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors text-sm font-medium"
      >
        <Info className="w-4 h-4" />
        {open ? 'Hide' : 'Show'} Anomaly Explanations
      </button>

      {open && (
        <div className="mt-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">Understanding Sales Anomalies</h4>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium text-red-600 dark:text-red-400">High Anomaly:</span>{' '}
              A sale significantly larger than usual. Could indicate successful promotion, bulk order, or data error.
              <br />
              <span className="text-slate-500 dark:text-slate-400 text-xs">Action: Verify promotions or data accuracy.</span>
            </div>
            <div>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">Low Anomaly:</span>{' '}
              A sale much smaller than expected. May indicate stockout, low demand, or data issue.
              <br />
              <span className="text-slate-500 dark:text-slate-400 text-xs">Action: Review inventory and marketing.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}