import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, RotateCcw, Scan, Hash, DollarSign, Package } from 'lucide-react';

const features = [
  {
    title: 'Stock In / Receive Goods',
    description: 'Quickly receive inventory with barcode scanning, automatic quantity updates, cost tracking, and condition assessment.',
    icon: ArrowDownLeft,
    gradient: 'from-emerald-500 to-teal-500',
    mockup: 'stock-in'
  },
  {
    title: 'Dispatch / Send Out',
    description: 'Fast order fulfillment with batch picking, automatic inventory deduction, and shipping label generation.',
    icon: ArrowUpRight,
    gradient: 'from-blue-500 to-cyan-500',
    mockup: 'dispatch'
  },
  {
    title: 'Returns Management',
    description: 'Handle returns efficiently with condition tracking, restocking decisions, and automatic inventory adjustments.',
    icon: RotateCcw,
    gradient: 'from-orange-500 to-red-500',
    mockup: 'returns'
  },
  {
    title: 'Barcode Scanner',
    description: 'Built-in barcode scanning for fast stock movements. Supports serialized items and batch scanning with duplicate detection.',
    icon: Scan,
    gradient: 'from-purple-500 to-pink-500',
    mockup: 'scanner'
  },
];

const StockInMockup = () => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-500/20">
      <div className="p-2 rounded-lg bg-emerald-500/20">
        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
      </div>
      <span className="font-semibold text-white">Stock In / Receive</span>
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
        <Package className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">Product: MacBook Pro M3</span>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
        <Hash className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">Quantity: 50 units</span>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
        <DollarSign className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">Unit Cost: $1,299.00</span>
      </div>
      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <div className="text-xs text-emerald-400 font-medium">Total Cost</div>
        <div className="text-2xl font-bold text-white">$64,950.00</div>
      </div>
      <button className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium">
        Confirm Stock In
      </button>
    </div>
  </div>
);

const DispatchMockup = () => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-500/20">
      <div className="p-2 rounded-lg bg-blue-500/20">
        <ArrowUpRight className="w-4 h-4 text-blue-400" />
      </div>
      <span className="font-semibold text-white">Dispatch Order</span>
    </div>
    <div className="space-y-3">
      {[
        { name: 'iPhone 15 Pro', qty: 5 },
        { name: 'AirPods Max', qty: 3 },
        { name: 'Magic Keyboard', qty: 10 },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
          <span className="text-sm text-slate-300">{item.name}</span>
          <span className="text-xs text-blue-400 font-medium">Qty: {item.qty}</span>
        </div>
      ))}
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <div className="text-xs text-blue-400 font-medium mb-1">Destination</div>
        <div className="text-sm font-semibold text-white">Downtown Branch Store</div>
      </div>
      <button className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium">
        Process Dispatch
      </button>
    </div>
  </div>
);

const ReturnsMockup = () => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-orange-500/20">
      <div className="p-2 rounded-lg bg-orange-500/20">
        <RotateCcw className="w-4 h-4 text-orange-400" />
      </div>
      <span className="font-semibold text-white">Return Processing</span>
    </div>
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-white/5">
        <div className="text-xs text-slate-400 mb-1">Product</div>
        <div className="text-sm font-medium text-white">Samsung Galaxy S24</div>
      </div>
      <div className="space-y-2">
        <div className="text-xs text-slate-400">Condition Assessment</div>
        <div className="grid grid-cols-2 gap-2">
          {['Good', 'Resellable', 'Minor Defect', 'Damaged'].map((cond, i) => (
            <button
              key={i}
              className={`py-1.5 rounded-lg text-xs font-medium ${
                i === 0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
        <div className="text-xs text-orange-400">Action: Restock to inventory</div>
      </div>
      <button className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium">
        Process Return
      </button>
    </div>
  </div>
);

const ScannerMockup = () => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-500/20">
      <div className="p-2 rounded-lg bg-purple-500/20">
        <Scan className="w-4 h-4 text-purple-400" />
      </div>
      <span className="font-semibold text-white">Barcode Scanner</span>
    </div>
    <div className="space-y-3">
      <div className="p-6 rounded-xl bg-purple-500/10 border-2 border-dashed border-purple-500/30 text-center">
        <Scan className="w-12 h-12 text-purple-400 mx-auto mb-2 animate-pulse" />
        <div className="text-sm text-purple-400">Scanning...</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <div className="text-lg font-bold text-white">45</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
          <div className="text-lg font-bold text-emerald-400">45</div>
          <div className="text-xs text-emerald-400">Unique</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <div className="text-lg font-bold text-amber-400">0</div>
          <div className="text-xs text-slate-400">Blocked</div>
        </div>
      </div>
      <div className="space-y-1">
        {['2024-SN-00451', '2024-SN-00452', '2024-SN-00453'].map((code, i) => (
          <div key={i} className="p-2 rounded bg-white/5 text-xs text-slate-300 font-mono">
            {code}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const mockups = {
  'stock-in': StockInMockup,
  'dispatch': DispatchMockup,
  'returns': ReturnsMockup,
  'scanner': ScannerMockup,
};

export default function FeatureShowcase() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            Feature Deep Dive
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Every Tool You Need
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              In One Place
            </span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const MockupComponent = mockups[feature.mockup];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 backdrop-blur-xl hover:border-white/10 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 flex-shrink-0`}>
                      <div className="w-full h-full rounded-xl bg-slate-950 p-2">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>

                  {/* Mockup */}
                  <MockupComponent />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}