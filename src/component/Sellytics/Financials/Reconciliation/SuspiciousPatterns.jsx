import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuspiciousPatterns({ patterns }) {
  if (patterns.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300">⚠️ Things to Check</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">Unusual patterns detected</p>
          </div>
        </div>
        <ul className="space-y-2">
          {patterns.map((pattern, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <span>{pattern}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}