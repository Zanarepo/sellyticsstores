// components/ClientCard.js
import React from "react";

export function ClientCard({ client, isSelected, onClick }) {
  const isInternal = client.client_type === "SELLYTICS_STORE";

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-indigo-600 bg-indigo-50 shadow-lg scale-105"
          : "border-gray-200 hover:border-indigo-400 hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-900">
          {client.client_name}
        </h3>
        {isInternal && (
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
            Your Store
          </span>
        )}
      </div>

      {client.business_name && client.business_name !== client.client_name && (
        <p className="text-sm text-gray-600 mb-2">{client.business_name}</p>
      )}

      <div className="text-sm text-gray-500 space-y-1">
        {client.email && <p>✉ {client.email}</p>}
        {client.phone && <p>☎ {client.phone}</p>}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        {isInternal ? "Internal Client" : "External Client"}
      </p>
    </div>
  );
}