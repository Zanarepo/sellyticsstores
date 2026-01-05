// Return Status Options
export const RETURN_STATUSES = {
  REQUESTED: {
    label: 'Requested',
    value: 'REQUESTED',
    color: 'amber',
    classes: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'Clock'
  },
  RECEIVED: {
    label: 'Received',
    value: 'RECEIVED',
    color: 'blue',
    classes: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'Package'
  },
  APPROVED: {
    label: 'Approved',
    value: 'APPROVED',
    color: 'emerald',
    classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: 'CheckCircle2'
  },
  REJECTED: {
    label: 'Rejected',
    value: 'REJECTED',
    color: 'rose',
    classes: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: 'XCircle'
  },
  QUARANTINED: {
    label: 'Quarantined',
    value: 'QUARANTINED',
    color: 'orange',
    classes: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: 'AlertTriangle'
  },
  REPAIR: {
    label: 'In Repair',
    value: 'REPAIR',
    color: 'purple',
    classes: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: 'Wrench'
  },
  WRITTEN_OFF: {
    label: 'Written Off',
    value: 'WRITTEN_OFF',
    color: 'slate',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: 'Trash2'
  }
};

// Item Condition Options
export const CONDITIONS = [
  { value: 'NEW', label: 'New / Unused', classes: 'bg-emerald-500' },
  { value: 'OPENED', label: 'Opened - Resellable', classes: 'bg-blue-500' },
  { value: 'MINOR_DEFECT', label: 'Minor Defect', classes: 'bg-amber-500' },
  { value: 'DAMAGED', label: 'Damaged', classes: 'bg-rose-500' },
  { value: 'FAULTY', label: 'Faulty', classes: 'bg-red-600' },
  { value: 'EXPIRED', label: 'Expired', classes: 'bg-slate-500' }
];

// Create Status Options
export const CREATE_STATUS_OPTIONS = [
  { value: 'REQUESTED', label: 'Requested (Awaiting Return)' },
  { value: 'RECEIVED', label: 'Received (Already Arrived)' },
  { value: 'REJECTED', label: 'Rejected' }
];

// Resolution Options
export const RESOLUTION_OPTIONS = [
  { value: 'APPROVED', label: 'Approve for Restock' },
  { value: 'QUARANTINED', label: 'Quarantine' },
  { value: 'REPAIR', label: 'Send for Repair' },
  { value: 'WRITTEN_OFF', label: 'Write Off' }
];

// Tab Filters
export const TAB_FILTERS = {
  PENDING: 'pending',
  PROCESSED: 'processed',
  ALL: 'all'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
};

// Real-time Channel
export const REALTIME_CHANNEL = 'warehouse_returns';