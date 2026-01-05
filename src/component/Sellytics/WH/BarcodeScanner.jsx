// components/BarcodeScanner.js
import React, { useState, useEffect, useRef } from "react";
import { useBarcodeScanner } from "./useBarcodeScanner";
import { supabase } from "../../../supabaseClient";

export function BarcodeScanner({ warehouseId, clientId, userId, onSessionStart }) {
  const [sessionId, setSessionId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const inputRef = useRef(null);

  const {
    scannedItems,
    duplicateItems,
    scan,
  // optional: if your hook supports reset
  } = useBarcodeScanner({
    sessionId,
    warehouseId,
    clientId,
  });

  // Create new scan session
 useEffect(() => {
  async function createSession() {
    if (!warehouseId || !clientId || !userId) {
      console.warn("Missing required props:", { warehouseId, clientId, userId });
      setSessionError("Missing warehouse, client, or user information.");
      setSessionLoading(false);
      return;
    }

    console.log("Attempting to create scan session with:", {
      warehouseId,
      clientId,
      userId,
    });

    setSessionLoading(true);
    setSessionError(null);

    try {
      const { data, error } = await supabase
        .from("warehouse_scan_sessions")
        .insert({
          warehouse_id: warehouseId,
          client_id: clientId,
          created_by: userId,
          status: "ACTIVE",
        })
        .select()
        .single();

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase insert error:", error);
        throw error; // Make sure it goes to catch
      }

      if (!data) {
        throw new Error("No data returned after insert");
      }

      console.log("Session created successfully:", data.id);
      setSessionId(data.id);
      if (onSessionStart) onSessionStart(data.id);
    } catch (err) {
      console.error("Failed to create scan session:", err);
      setSessionError(
        err.message || "Failed to start scan session. Check console for details."
      );
    } finally {
      console.log("Finally block reached — setting loading false");
      setSessionLoading(false);
    }
  }

  createSession();
}, [warehouseId, clientId, userId, onSessionStart]);


  // Focus input on mount and after each scan
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
}, [scannedItems.length]); // GOOD - only triggers on actual scans // Refocus after every successful scan

  const handleScan = (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.trim();
      if (value) {
        scan(value, null, userId);
      }
      // Clear input immediately for next scan
      e.target.value = "";
    }
  };

  const totalScans = scannedItems.length;
  const uniqueScans = new Set(scannedItems.map((i) => i.scanned_value)).size;
  const duplicateCount = duplicateItems.length;

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (sessionLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Starting scan session...</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <p className="text-red-600 font-medium">{sessionError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Barcode Scanner</h2>

      {/* Hidden input for continuous scanning */}
      <div className="mb-8">
        <label htmlFor="scanner-input" className="block text-lg font-medium text-gray-700 mb-2">
          Scan Mode Active — Point scanner here
        </label>
        <input
          id="scanner-input"
          type="text"
          placeholder="Scan a barcode or serial number..."
          onKeyDown={handleScan}
          ref={inputRef}
          autoFocus
          className="w-full px-6 py-4 text-2xl font-mono text-center border-4 border-dashed border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 transition"
        />
        <p className="mt-3 text-sm text-gray-600 text-center">
          Session ID: <span className="font-mono font-bold">{sessionId}</span>
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{totalScans}</p>
          <p className="text-sm text-blue-600">Total Scans</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-700">{uniqueScans}</p>
          <p className="text-sm text-green-600">Unique Items</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-700">{duplicateCount}</p>
          <p className="text-sm text-red-600">Duplicates</p>
        </div>
      </div>

      {/* Scanned Items List */}
      <div className="bg-white shadow rounded-lg border">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Scanned Items (Latest First)</h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {scannedItems.length === 0 ? (
            <p className="text-center py-12 text-gray-500">
              No items scanned yet. Start scanning!
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {[...scannedItems].reverse().map((item) => {
                const isDuplicate = duplicateItems.includes(item.scanned_value);
                return (
                  <li
                    key={item.id}
                    className={`px-6 py-4 flex items-center justify-between transition ${
                      isDuplicate ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-lg font-semibold text-gray-900">
                          {item.scanned_value}
                        </span>
                        {isDuplicate && (
                          <span className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">
                            DUPLICATE
                          </span>
                        )}
                      </div>
                      {item.detected_product_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.detected_product_name}
                          {item.detected_product_id && (
                            <span className="ml-2 text-gray-500">
                              (ID: {item.detected_product_id})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatTime(item.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {duplicateCount > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">
            {duplicateCount} duplicate scan(s) detected. These items were already scanned in this session.
          </p>
        </div>
      )}
    </div>
  );
}