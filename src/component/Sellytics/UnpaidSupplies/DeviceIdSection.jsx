import React from 'react';
import { Trash2, Plus, Camera } from 'lucide-react';

export default function DeviceIdSection({
  entry,
  index,
  onChange,
  onRemoveDevice,
  onAddDeviceRow,
  onOpenScanner,
}) {
  const deviceIds = Array.isArray(entry.deviceIds) ? entry.deviceIds : [''];
  const deviceSizes = Array.isArray(entry.deviceSizes) ? entry.deviceSizes : [''];

  const updateDeviceId = (deviceIndex, value) => {
    onChange(index, 'deviceId', { deviceIndex, value });
  };

  const updateDeviceSize = (deviceIndex, value) => {
    onChange(index, 'deviceSize', { deviceIndex, value });
  };

  return (
    <div className="mt-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4">
      <h4 className="font-bold text-lg flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        <Camera className="w-4 h-4" /> Unique Product Tracking ({deviceIds.length} ID{deviceIds.length !== 1 ? 's' : ''})
      </h4>

      {deviceIds.map((id, dIdx) => (
        <div
          key={dIdx}
          className="flex flex-wrap gap-2 items-center"
        >
          <input
            type="text"
            placeholder={`IMEI / Serial #${dIdx + 1}`}
            value={id}
            onChange={(e) => updateDeviceId(dIdx, e.target.value)}
            className="flex-1 min-w-[150px] px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-xl"
          />
          <input
            type="text"
            placeholder="Size (Optional)"
            value={deviceSizes[dIdx] || ''}
            onChange={(e) => updateDeviceSize(dIdx, e.target.value)}
            className="w-24 sm:w-32 px-3 py-2.5 bg-white dark:bg-slate-800 border rounded-xl flex-shrink-0"
          />

          {/* CAMERA BUTTON */}
          <button
            type="button"
            onClick={() => onOpenScanner(dIdx)}
            className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex-shrink-0"
          >
            <Camera className="w-4 h-4 text-indigo-600" />
          </button>

          {/* REMOVE BUTTON */}
          {deviceIds.length > 1 ? (
            <button
              type="button"
              onClick={() => onRemoveDevice(index, dIdx)}
              className="p-2 text-red-600 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-4 h-4 flex-shrink-0" />
          )}
        </div>
      ))}

      {/* ADD ROW BUTTON — bottom left */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => onAddDeviceRow(index)}
          className="flex items-center gap-1 text-indigo-600 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add another ID
        </button>
      </div>
    </div>
  );
}
