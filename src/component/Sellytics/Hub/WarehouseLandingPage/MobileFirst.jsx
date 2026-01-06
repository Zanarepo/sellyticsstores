import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Package, BarChart3, Zap, Wifi, WifiOff } from 'lucide-react';

export default function MobileFirst() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
              Mobile-First Design
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Manage Your Warehouse
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                From Your Phone
              </span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Designed mobile-first for warehouse staff on the go. Scan barcodes, update inventory, 
              and track movements right from your smartphone or tablet.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Scan, text: 'Built-in barcode scanner', color: 'purple' },
                { icon: Zap, text: 'Lightning-fast performance', color: 'yellow' },
                { icon: WifiOff, text: 'Works offline (coming soon)', color: 'emerald' },
                { icon: Package, text: 'Touch-optimized interface', color: 'blue' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20`}>
                    <feature.icon className={`w-5 h-5 text-${feature.color}-400`} />
                  </div>
                  <span className="text-white font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                <div className="text-2xl font-bold text-indigo-400 mb-1">85%</div>
                <div className="text-sm text-slate-400">Mobile usage</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                <div className="text-2xl font-bold text-purple-400 mb-1">3x</div>
                <div className="text-sm text-slate-400">Faster operations</div>
              </div>
            </div>
          </motion.div>

          {/* Mobile Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className="relative mx-auto max-w-[300px]">
              {/* Phone Body */}
              <div className="relative rounded-[3rem] bg-slate-900 border-8 border-slate-800 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-3xl z-10" />
                
                {/* Screen Content */}
                <div className="relative h-[640px] bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden">
                  {/* Status Bar */}
                  <div className="px-8 pt-8 pb-3 flex items-center justify-between text-xs text-slate-400">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      <div className="text-sm">100%</div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">Warehouse Hub</div>
                        <div className="text-[10px] text-slate-400">Mobile</div>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      {['Scan', 'Stock In', 'Dispatch'].map((action, i) => (
                        <button
                          key={i}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-medium ${
                            i === 0
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scanner View */}
                  <div className="p-4 space-y-3">
                    <div className="p-6 rounded-xl bg-indigo-500/10 border-2 border-dashed border-indigo-500/30 text-center">
                      <Scan className="w-12 h-12 text-indigo-400 mx-auto mb-2 animate-pulse" />
                      <div className="text-xs text-indigo-400">Ready to scan</div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Total', value: '23', color: 'slate' },
                        { label: 'Unique', value: '23', color: 'emerald' },
                        { label: 'Blocked', value: '0', color: 'amber' },
                      ].map((stat, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/5 text-center">
                          <div className={`text-base font-bold text-${stat.color}-400`}>{stat.value}</div>
                          <div className="text-[10px] text-slate-400">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Recent Scans */}
                    <div className="space-y-1">
                      {['2024-SN-00231', '2024-SN-00232', '2024-SN-00233'].map((code, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                          className="p-2 rounded-lg bg-white/5 text-[10px] text-slate-300 font-mono flex items-center justify-between"
                        >
                          <span>{code}</span>
                          <span className="text-emerald-400">✓</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold">
                      Complete Stock In (23 items)
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-20 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl"
              >
                <Scan className="w-5 h-5 text-emerald-400" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-4 bottom-32 p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-xl"
              >
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}