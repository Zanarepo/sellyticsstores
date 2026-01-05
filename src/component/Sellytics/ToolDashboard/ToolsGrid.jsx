// src/components/dashboard/ToolsGrid.jsx
import React from 'react';
import ToolCard from './ToolCard';
import { FaSearch } from 'react-icons/fa';

const ToolsGrid = ({ filteredTools, isPremium, allowedFeatures, onToolClick }) => {
  if (filteredTools.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <FaSearch className="text-4xl text-slate-400 dark:text-slate-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No results found</h3>
        <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
      {filteredTools.map((tool) => (
        <ToolCard
          key={tool.key}
          tool={tool}
          isPremium={isPremium}
          allowedFeatures={allowedFeatures}
          onClick={onToolClick}
        />
      ))}
    </div>
  );
};

export default ToolsGrid;