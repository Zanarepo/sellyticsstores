import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown} from 'lucide-react';

const faqs = [
  {
    question: 'Does Sellytics work without internet?',
    answer: 'Yes! Sellytics is built offline-first. You can record sales, add products, manage inventory, and run your entire business without internet. All changes automatically sync when you reconnect.',
  },
  {
    question: 'How does it work on slow 2G/3G networks?',
    answer: 'Sellytics is optimized for low-bandwidth areas. We use intelligent data compression and smart caching to ensure lightning-fast performance even on 2G networks. Most actions use less than 50KB of data.',
  },
  {
    question: 'How do I get started with Sellytics?',
    answer: 'Simply click "Start Free Trial" and create your account. Our setup wizard will guide you through adding your first products and making your first sale. Most users are fully set up within 10 minutes.',
  },
  {
    question: 'Can I import my existing inventory?',
    answer: 'Yes! You can import products via CSV file, or use our bulk add feature. We also offer migration assistance for Premium and Business plan users.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption for all data, regular automated backups, and comply with international data protection standards. Your business data is safe with us.',
  },
  {
    question: 'Can I manage multiple stores?',
    answer: 'Yes, our Business plan supports up to 3 stores with a centralized dashboard. You can view sales, inventory, and staff activity across all locations in real-time.',
  },
  {
    question: 'Is it easy to use for non-technical people?',
    answer: 'Absolutely! Sellytics has a simplified UX designed for all literacy levels and technical abilities. Your entire team — from market vendors to store managers — can use it from day one.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'Free users get email support. Premium users enjoy 24/7 priority support via chat and phone. Business users get a dedicated account manager.',
  },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-white/5 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full py-5 sm:py-6 flex items-center justify-between text-left group"
      >
        <span className="text-base sm:text-lg font-medium text-white group-hover:text-indigo-400 transition-colors duration-200 pr-4">
          {faq.question}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-600 rotate-180' : ''}`}>
          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ${isOpen ? 'text-white' : 'text-slate-400'}`} />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 sm:pb-6 text-sm sm:text-base text-slate-400 leading-relaxed pr-12 sm:pr-16">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative py-20 sm:py-32 overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20 mb-4 sm:mb-6">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Common{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Everything you need to know about Sellytics
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="bg-white/[0.02] rounded-2xl sm:rounded-3xl border border-white/5 p-4 sm:p-6 lg:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 sm:mt-12"
        >
          <p className="text-slate-400 mb-4">Still have questions?</p>
          <a
            href="mailto:support@sellytics.com"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200"
          >
            Contact our support team
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}