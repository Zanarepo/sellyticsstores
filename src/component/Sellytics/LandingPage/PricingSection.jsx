import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

// Currency configuration with conversion rates and formatting
const currencies = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', rate: 1, locale: 'en-NG' },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.0013, locale: 'en-US' },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.0010, locale: 'en-GB' },
  EUR: { symbol: '€', name: 'Euro', rate: 0.0012, locale: 'en-EU' },
  ZAR: { symbol: 'R', name: 'South African Rand', rate: 0.023, locale: 'en-ZA' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', rate: 0.17, locale: 'en-KE' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', rate: 0.016, locale: 'en-GH' },
};

// Base prices in NGN (Nigerian Naira)
const basePlans = [
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
      { text: 'Priority onboarding', included: true },
        { text: 'Multi-store management', included: false },
     { text: 'Access to a dedicted Warehouse', included: false },
    
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
    { text: 'Priority onboarding', included: true },
     { text: 'Access to a dedicted Warehouse', included: true },
    ],
    cta: 'Get Started',
    popular: false,
  },
];

// Detect user's location and suggest currency
const detectUserCurrency = () => {
  // Try to detect from browser timezone/locale
  const userLocale = navigator.language || 'en-NG';
  
  // Map common locales to currencies
  const localeMap = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-NG': 'NGN',
    'en-ZA': 'ZAR',
    'en-KE': 'KES',
    'en-GH': 'GHS',
  };
  
  // Check if we have a mapping
  for (const [locale, currency] of Object.entries(localeMap)) {
    if (userLocale.startsWith(locale)) {
      return currency;
    }
  }
  
  // Default to NGN
  return 'NGN';
};

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  // Auto-detect currency on mount
  useEffect(() => {
    const detectedCurrency = detectUserCurrency();
    setSelectedCurrency(detectedCurrency);
  }, []);

  // Convert price to selected currency
  const convertPrice = (priceInNGN) => {
    if (priceInNGN === 0) return 0;
    const rate = currencies[selectedCurrency].rate;
    return Math.round(priceInNGN * rate);
  };

  // Format price with proper currency formatting
  const formatPrice = (price) => {
    const currencyConfig = currencies[selectedCurrency];
    
    if (price === 0) return 'Free';
    
    try {
      return new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: selectedCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      // Fallback if Intl fails
      return `${currencyConfig.symbol}${price.toLocaleString()}`;
    }
  };

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

          {/* Controls Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {currencies[selectedCurrency].symbol} {selectedCurrency}
                </span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Currency Dropdown */}
              {showCurrencyMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowCurrencyMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-0 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-2 max-h-80 overflow-y-auto">
                      {Object.entries(currencies).map(([code, config]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setSelectedCurrency(code);
                            setShowCurrencyMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                            selectedCurrency === code
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {config.symbol} {code}
                          </span>
                          <span className="text-xs opacity-70">{config.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </div>

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
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {basePlans.map((plan, index) => {
            const monthlyPrice = convertPrice(plan.price.monthly);
            const yearlyPrice = convertPrice(plan.price.yearly);
            const displayPrice = isYearly ? yearlyPrice / 12 : monthlyPrice;

            return (
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
                    {plan.price.monthly === 0 ? (
                      <span className="text-4xl sm:text-5xl font-bold text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl sm:text-5xl font-bold text-white">
                          {formatPrice(displayPrice)}
                        </span>
                        <span className="text-slate-400 ml-2">/month</span>
                        {isYearly && (
                          <div className="text-sm text-slate-500 mt-1">
                            Billed {formatPrice(yearlyPrice)}/year
                          </div>
                        )}
                      </>
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
            );
          })}
        </div>

        {/* Currency Info Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-slate-500 mt-8"
        >
          Prices shown in {currencies[selectedCurrency].name}. 
          {selectedCurrency !== 'NGN' && ' Converted from NGN at current rates.'}
        </motion.p>
      </div>
    </section>
  );
}