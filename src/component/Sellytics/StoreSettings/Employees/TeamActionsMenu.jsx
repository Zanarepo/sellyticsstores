import { useState } from 'react';

export default function TeamActionsMenu({ onRemove, onSuspend, suspended }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex flex-col justify-center items-center gap-[3px] hover:bg-gray-100 rounded"
      >
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow z-10">
          <button
            onClick={onSuspend}
            className="block w-full px-4 py-2 text-sm hover:bg-gray-100"
          >
            {suspended ? 'Activate' : 'Suspend'}
          </button>
          <button
            onClick={onRemove}
            className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
