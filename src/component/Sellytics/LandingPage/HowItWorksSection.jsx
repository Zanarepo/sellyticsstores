import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Package, ShoppingCart, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Your Store',
    description: 'Sign up in under 2 minutes. Set up your store profile and customize your dashboard.',
  },
  {
    icon: Package,
    step: '02',
    title: 'Add Your Products',
    description: 'Import your inventory or add products manually. Set prices, quantities, and categories.',
  },
  {
    icon: ShoppingCart,
    step: '03',
    title: 'Record Sales',
    description: 'Log every sale with one tap. Track payments, generate receipts, and manage returns.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Get Insights',
    description: 'View real-time analytics, AI-powered recommendations, and growth opportunities.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 sm:py-32 overflow-hidden bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-purple-400 bg-purple-500/10 rounded-full border border-purple-500/20 mb-4 sm:mb-6">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Get Started in{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Minutes
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 px-4">
            No technical skills required. Our intuitive setup wizard guides you 
            through every step of the process.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center z-10">
                  <span className="text-xs sm:text-sm font-bold text-indigo-400">{step.step}</span>
                </div>

                {/* Card */}
                <div className="relative p-6 sm:p-8 pt-8 sm:pt-10 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500">
                  {/* Icon */}
                  <div className="inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 mb-4 sm:mb-6">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Mobile Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="sm:hidden flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}