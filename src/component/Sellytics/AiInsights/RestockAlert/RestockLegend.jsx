export default function RestockLegend() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:border dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        Understanding Recommendations
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
        <span className="font-medium text-yellow-600 dark:text-yellow-300">Restock recommended:</span> Product forecasted to run low. Consider ordering more.
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        <span className="font-medium text-green-600 dark:text-green-300">Sufficient stock:</span> No immediate action required.
      </p>
    </div>
  );
}
