import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    features: [
      { text: 'Up to 50 products', included: true },
      { text: 'Basic sales tracking', included: true },
      { text: 'Inventory management', included: true },
      { text: 'Expense tracking', included: true },
      { text: '30-day sales history', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'Multi-store management', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Premium',
    description: 'For growing businesses',
    price: { monthly: 15000, yearly: 144000 },
    features: [
      { text: 'Unlimited products', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Full sales history', included: true },
      { text: 'Staff onboarding', included: true },
      { text: 'Priority support 24/7', included: true },
      { text: 'Printable receipts', included: true },
      { text: 'Team collaboration', included: true },
      { text: 'Multi-store management', included: false },
    ],
    cta: 'Start Premium Trial',
    popular: true,
  },
  {
    name: 'Business',
    description: 'For multi-store operations',
    price: { monthly: 25000, yearly: 240000 },
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Up to 3 stores', included: true },
      { text: 'Advanced product insights', included: true },
      { text: 'Multi-store dashboard', included: true },
      { text: 'Team management', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-20 sm:py-32 overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-cyan-400 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-4 sm:mb-6">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Simple,{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Transparent
            </span>{' '}
            Pricing
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-8 px-4">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-white/5 border border-white/10">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isYearly 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isYearly 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-emerald-400">Save 20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative rounded-2xl sm:rounded-3xl ${
                plan.popular 
                  ? 'bg-gradient-to-b from-indigo-600/20 to-purple-600/20 border-2 border-indigo-500/50' 
                  : 'bg-white/[0.02] border border-white/5'
              } overflow-hidden`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-4 py-1.5 rounded-bl-xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular
                </div>
              )}

              <div className="p-6 sm:p-8">
                {/* Plan Info */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm sm:text-base text-slate-400 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6 sm:mb-8">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    ₦{(isYearly ? plan.price.yearly / 12 : plan.price.monthly).toLocaleString()}
                  </span>
                  <span className="text-slate-400 ml-2">/month</span>
                  {isYearly && plan.price.monthly > 0 && (
                    <div className="text-sm text-slate-500 mt-1">
                      Billed ₦{plan.price.yearly.toLocaleString()}/year
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to="/register"
                  className={`block w-full text-center py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 mb-6 sm:mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features */}
                <ul className="space-y-3 sm:space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm sm:text-base ${feature.included ? 'text-slate-300' : 'text-slate-600'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}