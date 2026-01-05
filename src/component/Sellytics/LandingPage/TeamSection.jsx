import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Mail } from 'lucide-react';

const team = [
  {
    name: 'Prince Zana',
    role: 'CEO & Co-Founder',
    bio: 'X-Softcomer',
    image: '/newlogo.png',
    linkedin: '#',
    twitter: '#',
  },

  {
    name: 'Chioma Okonkwo',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineer. Expert in AI and scalable systems.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop&crop=face',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Emmanuel Osei',
    role: 'Head of Product',
    bio: 'Previously at Paystack. Passionate about user experience.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&fit=crop&crop=face',
    linkedin: '#',
    twitter: '#',
  }
 
];

export default function TeamSection() {
  return (
    <section id="team" className="relative py-20 sm:py-32 overflow-hidden bg-slate-900">
      {/* Background */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4 sm:mb-6">
            Our Team
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Meet the{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Visionaries
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 px-4">
            A passionate team of entrepreneurs, engineers, and operators 
            building the future of retail management in Africa.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:bg-white/[0.04]">
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-500/30 transition-all duration-500">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-indigo-400 mb-2 sm:mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-slate-400 mb-4 sm:mb-5 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={member.linkedin}
                      className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a
                      href={member.twitter}
                      className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href={`mailto:${member.name.toLowerCase().replace(' ', '.')}@sellytics.com`}
                      className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}