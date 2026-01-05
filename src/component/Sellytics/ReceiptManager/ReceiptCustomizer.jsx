
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

export default function ReceiptCustomizer({ styles, updateStyle, resetStyles }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-900 dark:text-white">Customize Receipt</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Personalize your receipt design</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-6 space-y-5">
              {/* Header Background Color */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Header Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={styles.headerBgColor}
                    onChange={(e) => updateStyle('headerBgColor', e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    value={styles.headerBgColor}
                    onChange={(e) => updateStyle('headerBgColor', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Header Text Color */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Header Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={styles.headerTextColor}
                    onChange={(e) => updateStyle('headerTextColor', e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    value={styles.headerTextColor}
                    onChange={(e) => updateStyle('headerTextColor', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={styles.accentColor}
                    onChange={(e) => updateStyle('accentColor', e.target.value)}
                    className="w-16 h-12 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600"
                  />
                  <input
                    type="text"
                    value={styles.accentColor}
                    onChange={(e) => updateStyle('accentColor', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Font Family
                </label>
                <select
                  value={styles.fontFamily}
                  onChange={(e) => updateStyle('fontFamily', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                >
                  <option value="monospace">Monospace</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={styles.logoUrl}
                  onChange={(e) => updateStyle('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Reset Button */}
              <button
                onClick={resetStyles}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}