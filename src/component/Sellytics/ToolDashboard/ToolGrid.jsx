// src/components/dashboard/ToolGrid.jsx
import { FaSearch, FaTimes, FaFilter, FaChevronRight, FaLock, FaCrown } from 'react-icons/fa';

export default function ToolGrid({
  tools,
  allowedFeatures,
  isPremium,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onToolSelect,
}) {
  const categories = ['All', ...new Set(tools.map(t => t.category))];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap ${
                selectedCategory === cat ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-20">
          <FaSearch className="text-6xl text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No tools found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map(tool => {
            const isAccessible = (tool.isFreemium || isPremium) && allowedFeatures.includes(tool.key);
            const Icon = tool.icon;

            return (
              <div
                key={tool.key}
                onClick={() => isAccessible && onToolSelect(tool.key)}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all ${
                  isAccessible ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {!tool.isFreemium && (
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <FaCrown /> PRO
                  </div>
                )}
                <div className="mb-5">
                  <Icon className="text-5xl text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{tool.label}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{tool.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{tool.category}</span>
                  {isAccessible && <FaChevronRight />}
                </div>
                {!isAccessible && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <FaLock className="text-3xl mx-auto mb-2" />
                      <p>{tool.isFreemium ? 'Premium' : 'Admin'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}