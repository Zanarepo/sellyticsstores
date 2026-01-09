export default function InventoryTable({ filteredRecords, stores }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Detailed Inventory Records</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-indigo-50 dark:bg-indigo-900">
            <th className="p-3 text-left">Store</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Available Qty</th>
            <th className="p-3 text-left">Quantity Sold</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map((r, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="p-3">{stores.find(s => s.id === r.store_id)?.shop_name || 'Unknown'}</td>
              <td className="p-3">{r.dynamic_product?.name || 'Unknown'}</td>
              <td className="p-3">{r.available_qty}</td>
              <td className="p-3">{r.quantity_sold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
