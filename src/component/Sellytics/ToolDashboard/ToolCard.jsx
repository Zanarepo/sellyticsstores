// src/components/dashboard/ToolCard.jsx
import React from 'react';
import { FaCrown, FaChevronRight, FaLock } from 'react-icons/fa';

const ToolCard = ({ tool, isPremium, allowedFeatures, onClick }) => {
  const isAccessible = (tool.isFreemium || isPremium) && allowedFeatures.includes(tool.key);
  const Icon = tool.icon;

  return (
    <div
      onClick={() => isAccessible && onClick(tool.key)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 lg:p-7 transition-all duration-300 ${
        isAccessible
          ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:border-indigo-400 dark:hover:border-indigo-600'
          : 'cursor-not-allowed opacity-50'
      }`}
    >
      {!tool.isFreemium && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800 shadow-sm">
            <FaCrown className="text-xs" />
            <span>PRO</span>
          </div>
        </div>
      )}

      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 mb-5 transition-all duration-300 ${
        isAccessible ? 'group-hover:scale-110 group-hover:rotate-3' : ''
      }`}>
        <Icon className="text-3xl lg:text-4xl text-indigo-600 dark:text-indigo-400" />
      </div>

      <h3 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {tool.label}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
        {tool.desc}
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
          {tool.category}
        </span>
        {isAccessible && (
          <FaChevronRight className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
        )}
      </div>

      {!isAccessible && (
        <div className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
              <FaLock className="text-2xl text-red-600 dark:text-red-400" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {!allowedFeatures.includes(tool.key) ? 'Contact Admin' : 'Upgrade Required'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolCard;