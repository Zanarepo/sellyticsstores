// src/components/dashboard/ActiveToolContent.jsx
import { FaArrowLeft, FaLock, FaCrown } from 'react-icons/fa';

export default function ActiveToolContent({ activeTool, tools, allowedFeatures, isPremium, setActiveTool }) {
  const tool = tools.find(t => t.key === activeTool);
  if (!tool) return null;

  const isAllowed = allowedFeatures.includes(activeTool);
  const isFreemiumAllowed = tool.isFreemium || isPremium;

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <FaLock className="text-6xl text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
          <p className="text-slate-600 mb-6">Contact your admin to unlock this feature.</p>
          <button onClick={() => setActiveTool(null)} className="px-6 py-3 bg-indigo-600 text-white rounded-lg">
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!isFreemiumAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <FaCrown className="text-6xl text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Premium Feature</h2>
          <p className="text-slate-600 mb-6">Upgrade your subscription to access this tool.</p>
          <a href="/upgrade" className="px-6 py-3 bg-amber-600 text-white rounded-lg inline-block">
            Upgrade Now
          </a>
          <button onClick={() => setActiveTool(null)} className="mt-4 text-indigo-600">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600">
            <FaArrowLeft /> Back
          </button>
          <div className="text-right">
            <h2 className="text-xl font-bold">{tool.label}</h2>
            <p className="text-sm text-slate-500">{tool.desc}</p>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        {React.cloneElement(tool.component, { setActiveTool })}
      </main>
    </div>
  );
}