import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import logo from '../../Assets/newlogo.png';
const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Offline-First', href: '#offline' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Team', href: '#team' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}


<Link to="/" className="flex items-center gap-2">
  <div  className="h-16 sm:h-20 md:h-28 w-auto min-h-[48px] max-h-[80%] max-w-[80%]">
    <img src={logo}   
      alt="Sellytics Logo"
      className="w-full h-full object-contain"
    />
  </div>
</Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 sm:top-20 z-40 lg:hidden"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                  >
                    {link.name}
                  </button>
                ))}
                <div className="pt-4 space-y-3 border-t border-white/10 mt-4">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 text-base font-medium text-slate-300 hover:text-white border border-white/10 rounded-full transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}