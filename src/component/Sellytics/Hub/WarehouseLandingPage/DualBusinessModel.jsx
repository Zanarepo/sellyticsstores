import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign, TrendingUp, Package, Zap, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function DualBusinessModel() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
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
          <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            Dual Revenue Model
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              One Platform.
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Two Revenue Streams.
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
            Manage your own inventory while providing warehousing services to other businesses
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Internal Management */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-full p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/20 backdrop-blur-xl">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 mb-6">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Internal Operations
              </h3>
              <p className="text-slate-400 mb-6 text-base sm:text-lg leading-relaxed">
                Manage your own warehouse operations efficiently with powerful tools designed for modern inventory management.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: Package, text: 'Track your own inventory across multiple locations' },
                  { icon: TrendingUp, text: 'Real-time analytics and performance metrics' },
                  { icon: Zap, text: 'Fast stock-in/out with barcode scanning' },
                  { icon: Shield, text: 'Secure data with role-based access' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300 text-sm sm:text-base">{feature.text}</span>
                  </div>
                ))}
              </div>

            
                <Link
            to="/register"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium transition-all duration-300 hover:scale-105">
             
           Optimize Your Warehouse
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

            </div>
          </motion.div>

          {/* External Client Management */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-full p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10 border border-emerald-500/20 backdrop-blur-xl relative overflow-hidden">
              {/* Shine Effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
              
              {/* Icon with Badge */}
              <div className="relative w-16 h-16 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5">
                  <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                    <Users className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-bold text-white">
                  NEW
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Client Services
                <span className="ml-2 text-emerald-400">💰</span>
              </h3>
              <p className="text-slate-400 mb-6 text-base sm:text-lg leading-relaxed">
                Turn your warehouse into a profit center by offering professional warehousing services to external businesses.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  { icon: Users, text: 'Manage multiple client businesses separately' },
                  { icon: DollarSign, text: 'Bill clients for storage and handling services' },
                  { icon: Shield, text: 'Isolated inventory data for each client' },
                  { icon: Package, text: 'Full transparency' },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-slate-300 text-sm sm:text-base">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Highlight Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">Revenue Opportunity</span>
                </div>
                <p className="text-sm text-slate-300">
                  Generate extra income from unused warehouse space and existing operations.
                </p>
              </div>

                      
          <Link
            to="/register"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium transition-all duration-300 hover:scale-105">

            Start Earning Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>


              
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: '40%', label: 'Average revenue increase from client services' },
              { value: '2.5x', label: 'ROI within first year of client onboarding' },
              { value: '95%', label: 'Customer satisfaction from dual model users' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}