// components/ScanMetadataEntry.js
import React, { useState } from "react";
import { supabase } from '../../../supabaseClient';
import toast from "react-hot-toast";
import { useSession } from "./useSession";

export function ScanMetadataEntry({ sessionId }) {
  const { userId } = useSession();
  const [scannedItems, setScannedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notes, setNotes] = useState("");

  // Real-time fetch
  React.useEffect(() => {
    if (!sessionId) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("warehouse_scan_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at");
      setScannedItems(data || []);
    };
    fetch();

    const channel = supabase
      .channel("metadata-entry")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "warehouse_scan_events", filter: `session_id=eq.${sessionId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setScannedItems((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setScannedItems((prev) =>
              prev.map((i) => (i.id === payload.new.id ? payload.new : i))
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sessionId]);

  const saveNotes = async () => {
    if (!selectedItem) return;

    const { error } = await supabase
      .from("warehouse_scan_events")
      .update({ notes: notes.trim() || null, updated_by: userId })
      .eq("id", selectedItem.id);

    if (error) {
      toast.error("Failed to save notes");
    } else {
      toast.success("Notes saved!");
      setNotes("");
      setSelectedItem(null);
    }
  };

  if (!sessionId) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h2 className="text-2xl font-bold mb-6">Add Metadata to Scanned Items</h2>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-4">Scanned Items ({scannedItems.length})</h3>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {scannedItems.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setNotes(item.notes || "");
                }}
                className={`p-4 rounded-lg cursor-pointer transition ${
                  selectedItem?.id === item.id
                    ? "bg-indigo-100 border-2 border-indigo-500"
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-mono font-bold">{item.scanned_value}</span>
                  {item.is_duplicate && <span className="text-red-600 text-sm">DUPLICATE</span>}
                </div>
                {item.notes && <p className="text-sm text-gray-600 mt-2 italic">"{item.notes}"</p>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          {selectedItem ? (
            <>
              <h3 className="font-semibold mb-4">
                Notes for: <span className="font-mono">{selectedItem.scanned_value}</span>
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                placeholder="e.g., Slight scratch on corner, Missing tag, Perfect condition..."
                className="w-full p-4 border rounded-lg resize-none"
              />
              <button
                onClick={saveNotes}
                className="mt-4 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Notes
              </button>
            </>
          ) : (
            <p className="text-center text-gray-500 py-20">
              Click an item to add notes or condition details
            </p>
          )}
        </div>
      </div>
    </div>
  );
}