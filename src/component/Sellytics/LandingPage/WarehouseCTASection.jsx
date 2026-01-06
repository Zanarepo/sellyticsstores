import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Warehouse, TrendingUp, DollarSign, ArrowRight, Zap, Users, Package } from 'lucide-react';
import { createPageUrl } from './utils';

export default function WarehouseCTASection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                New Feature Unlocked
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Turn Your Warehouse
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Into a Profit Center
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-400 mb-8 leading-relaxed">
              Optimize your internal operations <span className="text-white font-semibold">and</span> generate extra revenue by offering warehousing services to external clients. All from one powerful platform.
            </p>

            {/* Key Benefits */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Zap, text: 'Streamline Operations', color: 'yellow' },
                { icon: DollarSign, text: 'Generate Extra Income', color: 'emerald' },
                { icon: Users, text: 'Manage Multiple Clients', color: 'purple' },
                { icon: Package, text: 'Real-Time Tracking', color: 'blue' },
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className={`p-2 rounded-lg bg-${benefit.color}-500/10`}>
                    <benefit.icon className={`w-4 h-4 text-${benefit.color}-400`} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-white/10">
              {[
                { value: '2K+', label: 'Warehouses' },
                { value: '40%', label: 'Revenue Boost' },
                { value: '5M+', label: 'Items Tracked' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              to={createPageUrl('warehouse')}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-2xl text-white font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
            >
              <Warehouse className="w-5 h-5" />
              Explore Warehouse Hub
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Visual Side - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Link to={createPageUrl('warehouse')} className="block group">
              {/* Main Dashboard Card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl group-hover:border-emerald-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                {/* Header */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                      <Warehouse className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Warehouse Dashboard</h3>
                      <p className="text-xs text-slate-400">Real-time overview</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { label: 'Stock', value: '45K', trend: '+12%', color: 'blue' },
                      { label: 'Value', value: '$892K', trend: '+8%', color: 'emerald' },
                      { label: 'Clients', value: '23', trend: '+3', color: 'purple' },
                    ].map((stat, i) => (
                      <div key={i} className="p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className={`text-lg sm:text-xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                        <div className="text-[10px] text-slate-500">{stat.label}</div>
                        <div className="text-[10px] text-emerald-400 font-medium">{stat.trend}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-3">
                  {/* Store Cards */}
                  {[
                    { name: 'Downtown Store', items: 234, type: 'Internal', color: 'emerald' },
                    { name: 'Tech Solutions Co.', items: 189, type: 'Client', color: 'indigo' },
                  ].map((store, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded bg-${store.color}-500/10`}>
                          <Package className={`w-3 h-3 text-${store.color}-400`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{store.name}</div>
                          <div className="text-xs text-slate-400">{store.items} products</div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full bg-${store.color}-500/10 text-${store.color}-400 border border-${store.color}-500/20`}>
                        {store.type}
                      </span>
                    </motion.div>
                  ))}

                  {/* Revenue Badge */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">+40% Revenue Growth</span>
                    </div>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl"
              >
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-4 p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-xl"
              >
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}