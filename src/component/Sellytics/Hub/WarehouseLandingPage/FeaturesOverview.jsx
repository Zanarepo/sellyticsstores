import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  ArrowLeftRight, 
  RotateCcw, 
  BarChart3, 
  Users, 
  Scan,
  Smartphone,
  DollarSign 
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Real-time stock tracking with automatic updates, low stock alerts, and batch management.',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ArrowLeftRight,
    title: 'Transfer Hub',
    description: 'Seamlessly move inventory between locations, stores, and clients with full tracking.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: RotateCcw,
    title: 'Returns Management',
    description: 'Handle returns efficiently with condition tracking, restocking, and damage assessment.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Powerful dashboards showing inventory value, movement patterns, and performance metrics.',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Manage external clients, track their inventory separately, and bill for services.',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Scan,
    title: 'Barcode Scanner',
    description: 'Fast stock-in and dispatch with built-in barcode scanning. Support for serialized items.',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Fully responsive interface works perfectly on phones, tablets, and desktops.',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    icon: DollarSign,
    title: 'Revenue Generation',
    description: 'Turn your warehouse into a profit center by offering services to external businesses.',
    gradient: 'from-yellow-500 to-amber-500'
  },
];

export default function FeaturesOverview() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
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
          <span className="inline-block px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
            Everything You Need
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Modern Warehousing
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Built for businesses that want to optimize operations and grow revenue
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 backdrop-blur-xl hover:border-white/10 transition-all duration-300 hover:scale-105">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-4`}>
                  <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}