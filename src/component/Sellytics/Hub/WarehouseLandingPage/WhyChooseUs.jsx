import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  TrendingUp,
  ArrowRight, 
  Users, 
  Award, 
  Clock,
  DollarSign,
  Smartphone,
  CheckCircle2 
} from 'lucide-react';

const reasons = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with barcode scanning, bulk operations, and real-time updates.',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with role-based access, data isolation, and 99.9% uptime.',
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Revenue',
    description: 'Monetize unused warehouse space by offering services to external clients.',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Users,
    title: 'Multi-Client Ready',
    description: 'Manage unlimited clients with completely isolated data and custom billing.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Award,
    title: 'Industry Best',
    description: '4.9/5 rating from 2,000+ warehouses. Trusted by businesses worldwide.',
    gradient: 'from-rose-500 to-red-500'
  },
  {
    icon: Clock,
    title: 'Real-Time Sync',
    description: 'Instant updates across all devices. Never miss a stock movement.',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    icon: DollarSign,
    title: 'Cost Effective',
    description: 'Transparent pricing with no hidden fees. ROI within first 6 months.',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Designed for mobile devices. Manage your warehouse from anywhere.',
    gradient: 'from-violet-500 to-purple-500'
  },
];

const comparisonItems = [
  'Real-time inventory tracking',
  'Multi-client management',
  'Barcode scanning',
  'Returns processing',
  'Transfer management',
  'Analytics dashboard',
  'Mobile app access',
  'Client billing tools',
];

export default function WhyChooseUs() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
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
            Why WarehouseHub
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Built Different.
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Built Better.
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            The only warehouse management platform designed for both internal operations and client services
          </p>
        </motion.div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 backdrop-blur-xl hover:border-white/10 transition-all duration-300 hover:scale-105">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${reason.gradient} p-0.5 mb-4`}>
                  <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center">
                    <reason.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{reason.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{reason.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Everything You Need. Nothing You Don't.
              </h3>
              <p className="text-slate-400">
                Compare us with traditional warehouse management systems
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Systems */}
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-2 rounded-full bg-slate-700/50 text-slate-400 text-sm font-medium">
                    Traditional Systems
                  </div>
                </div>
                {comparisonItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    <span className="text-sm text-slate-400 line-through">{item}</span>
                  </div>
                ))}
              </div>

              {/* WarehouseHub */}
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium">
                    WarehouseHub
                  </div>
                </div>
                {comparisonItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-white font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
               <Link
            to="/register"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
              <p className="text-xs text-slate-500 mt-3">No credit card required • Free for 14 days</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}