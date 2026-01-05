import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'KC Enterprise',
    role: 'Phone Shop Owner, Lagos',
    content: 'Sellytics transformed how I manage my three phone shops. I can now see real-time sales from all locations on my phone. Revenue increased by 40% in just 3 months!',
    rating: 5,
    image: '/newlogo.pn',
  },
  {
    name: 'Sonia Blessing',
    role: 'Supermarket Manager, Abuja',
    content: 'The offline sales and product inventory has been a life-saver, in days were there has been erratic network in my store, I do not get panicked again, all thanks to Sellytics Offline feature - really amazing',
    rating: 5,
    image: '/Sonia.jpeg',
  },
  {
    name: 'Shiffy',
    role: 'Warehouse Manager',
    content: 'Managing inventory across multiple warehouses was a nightmare before Sellytics. Now everything is synced and I have complete visibility.',
    rating: 5,
    image: '',
  },
 
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-slate-900">
      {/* Background */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-pink-400 bg-pink-500/10 rounded-full border border-pink-500/20 mb-4 sm:mb-6">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 px-4">
            Join over 10,000 businesses across Africa who trust Sellytics 
            to manage their operations.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500/20 mb-4" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-white/10"
                />
                <div>
                  <div className="font-semibold text-white text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}