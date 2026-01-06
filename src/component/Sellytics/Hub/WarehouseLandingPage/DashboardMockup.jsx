import React from 'react';
import { motion } from 'framer-motion';
import { 
  Warehouse, 
  Package, 
  TrendingUp, 
  Users, 
  Search,
  Building2,
  ChevronDown,
  BarChart3,
  ArrowLeftRight,
  RotateCcw,
  Store
} from 'lucide-react';

export default function DashboardMockup() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            See It In Action
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Beautiful & Intuitive
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard Interface
            </span>
          </h2>
        </motion.div>

        {/* Desktop Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Browser Chrome */}
          <div className="rounded-t-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-3 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 mx-4 bg-slate-700 rounded-lg px-3 py-1 text-xs text-slate-400">
               www.sellyticshq.com/warehouse
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="rounded-b-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Warehouse className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-white">Warehouse Hub</h1>
                    <p className="text-xs text-slate-400">Inventory Management</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select className="w-full pl-9 pr-9 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white appearance-none">
                      <option>Main Warehouse</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>

                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex gap-1 mt-4">
                {[
                  { icon: BarChart3, label: 'Overview', active: true },
                  { icon: Package, label: 'Inventory' },
                  { icon: ArrowLeftRight, label: 'Transfers' },
                  { icon: RotateCcw, label: 'Returns' },
                ].map((item, i) => (
                  <button
                    key={i}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      item.active
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

           {/* Stats Cards */}
<div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {[
    { icon: Package, label: 'Total Stock', value: '45,231', change: '+12%', color: 'blue' },
    { icon: TrendingUp, label: 'Stock Value', value: '$892K', change: '+8%', color: 'emerald' },
    { icon: Users, label: 'Active Clients', value: '23', change: '+3', color: 'purple' },
    { icon: ArrowLeftRight, label: 'Transfers', value: '156', change: '+18%', color: 'orange' },
  ].map((stat, i) => {
    const colorMap = {
      blue: 'bg-blue-500/10 text-blue-400',
      emerald: 'bg-emerald-500/10 text-emerald-400',
      purple: 'bg-purple-500/10 text-purple-400',
      orange: 'bg-orange-500/10 text-orange-400',
    };

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: i * 0.1 }}
        className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${colorMap[stat.color]}`}>
            <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-xs font-medium text-emerald-400">
            {stat.change}
          </span>
        </div>

        <div className="text-xl sm:text-2xl font-bold text-white mb-1">
          {stat.value}
        </div>
        <div className="text-xs sm:text-sm text-slate-400">
          {stat.label}
        </div>
      </motion.div>
    );
  })}
</div>

{/* Store Cards */}
<div className="px-4 sm:px-6 pb-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
    <h3 className="text-base sm:text-lg font-semibold text-white">
      Internal Stores
    </h3>
    <span className="text-xs sm:text-sm text-slate-400">
      8 active stores
    </span>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[
      { name: 'Downtown Branch', products: 234, color: 'emerald' },
      { name: 'Airport Location', products: 189, color: 'blue' },
    ].map((store, i) => {
      const colorMap = {
        blue: 'bg-blue-500/10 text-blue-400',
        emerald: 'bg-emerald-500/10 text-emerald-400',
      };

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${colorMap[store.color]}`}>
              <Store className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Internal
            </span>
          </div>

          <h4 className="font-semibold text-white text-sm sm:text-base mb-1">
            {store.name}
          </h4>
          <p className="text-xs sm:text-sm text-slate-400">
            {store.products} products
          </p>
        </motion.div>
      );
    })}
  </div>
</div>
          </div>
          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute -left-4 top-1/2 -translate-y-1/2 hidden lg:block"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-xl">
              <div className="text-sm text-emerald-400 font-medium mb-1">Live Updates</div>
              <div className="text-xs text-slate-300">Real-time sync</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute -right-4 top-1/3 hidden lg:block"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl">
              <div className="text-sm text-purple-400 font-medium mb-1">Multi-Client</div>
              <div className="text-xs text-slate-300">Isolated data</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}