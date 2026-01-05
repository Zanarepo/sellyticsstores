import React from 'react';
import { motion } from 'framer-motion';
import { History, Package, Box, TrendingUp, Clock, User, Plus, Minus, ChevronRight, BarChart2 } from 'lucide-react';

const mockupFeatures = [
  {
    title: 'Activity History',
    subtitle: 'Complete Audit Trail',
    description: 'Track every inventory movement with detailed logs showing who made changes, when, and why. Perfect for accountability and compliance.',
    features: [
      { icon: History, text: 'Real-time activity logging' },
      { icon: User, text: 'User attribution tracking' },
      { icon: Clock, text: 'Timestamp precision' },
      { icon: Plus, text: 'Stock increase monitoring' },
      { icon: Minus, text: 'Stock decrease alerts' },
    ],
    screenBg: 'from-indigo-950 to-slate-900',
    accentColor: 'indigo',
    layout: 'left', // screen on left
  },
  {
    title: 'Inventory Dashboard',
    subtitle: 'Smart Stock Overview',
    description: 'Visual inventory dashboard with intelligent stock alerts, sales tracking, and dynamic pricing. Instantly see what needs attention.',
    features: [
      { icon: Package, text: 'Real-time stock levels' },
      { icon: TrendingUp, text: 'Sales performance metrics' },
      { icon: BarChart2, text: 'IMEI/Barcode tracking for unique items' },
      { icon: BarChart2, text: 'Barcode tracking for non-unique items' },
      { icon: ChevronRight, text: 'Quick action access' },
    ],
    screenBg: 'from-emerald-950 to-slate-900',
    accentColor: 'emerald',
    layout: 'right', // screen on right
  },
  {
    title: 'Product Dashboard',
    subtitle: 'Complete Product Management',
    description: 'Comprehensive product dashboard with offline support, pending sync indicators, and full product management operations. Manage your catalog seamlessly.',
    features: [
      { icon: Box, text: 'Unique item identification' },
      { icon: Package, text: 'Quantity at a glance' },
      { icon: Clock, text: 'Offline mode support' },
      { icon: User, text: 'Update tracking' },
    ],
    screenBg: 'from-purple-950 to-slate-900',
    accentColor: 'purple',
    layout: 'left', // screen on left
  },
];

const MockScreenCard = ({ mockup, index }) => {
  const isLeft = mockup.layout === 'left';
  
  return (
    <div className="relative py-16 sm:py-24 overflow-hidden">
      {/* Background Blur Effects */}
      <div className="absolute inset-0">
        <div className={`absolute ${isLeft ? 'left-1/4' : 'right-1/4'} top-1/4 w-[500px] h-[500px] rounded-full blur-[150px] ${
          mockup.accentColor === 'indigo' ? 'bg-indigo-600/10' :
          mockup.accentColor === 'emerald' ? 'bg-emerald-600/10' :
          'bg-purple-600/10'
        }`} />
      </div>

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 sm:gap-12 items-center ${!isLeft ? 'lg:grid-flow-dense' : ''}`}>
        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`relative ${!isLeft ? 'lg:col-start-2' : ''}`}
        >
          <div className="relative mx-auto max-w-[320px]">
            {/* Phone Frame */}
            <div className="relative bg-slate-900 rounded-[2.5rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-slate-800 rounded-b-3xl z-10" />
              
              {/* Screen Content */}
              <div className={`relative aspect-[9/19] bg-gradient-to-b ${mockup.screenBg} p-5`}>
                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-white mb-5 px-2">
                  <span className="font-semibold">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-6 h-3 border border-white rounded-sm relative">
                      <div className="absolute inset-0.5 bg-emerald-500 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Screen Content Based on Type */}
                {index === 0 && <HistoryScreenContent />}
                {index === 1 && <InventoryScreenContent />}
                {index === 2 && <ProductScreenContent />}
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`absolute ${isLeft ? '-right-4' : '-left-4'} top-1/3 rounded-2xl p-3 backdrop-blur-xl ${
                mockup.accentColor === 'indigo' ? 'bg-indigo-600/20 border border-indigo-500/30' :
                mockup.accentColor === 'emerald' ? 'bg-emerald-600/20 border border-emerald-500/30' :
                'bg-purple-600/20 border border-purple-500/30'
              }`}
            >
              {React.createElement(mockup.features[0].icon, {
                className: mockup.accentColor === 'indigo' ? 'w-5 h-5 text-indigo-400' :
                          mockup.accentColor === 'emerald' ? 'w-5 h-5 text-emerald-400' :
                          'w-5 h-5 text-purple-400'
              })}
            </motion.div>
          </div>
        </motion.div>

        {/* Features Description */}
        <motion.div
          initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={!isLeft ? 'lg:col-start-1' : ''}
        >
          <span className={`inline-block px-4 py-1.5 text-sm font-medium rounded-full mb-6 ${
            mockup.accentColor === 'indigo' ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' :
            mockup.accentColor === 'emerald' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
            'text-purple-400 bg-purple-500/10 border border-purple-500/20'
          }`}>
            {mockup.subtitle}
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {mockup.title}
          </h2>
          
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            {mockup.description}
          </p>

          {/* Features List */}
          <div className="space-y-4">
            {mockup.features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 group"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  mockup.accentColor === 'indigo' ? 'bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20' :
                  mockup.accentColor === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20' :
                  'bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20'
                }`}>
                  {React.createElement(feature.icon, {
                    className: mockup.accentColor === 'indigo' ? 'w-5 h-5 text-indigo-400' :
                              mockup.accentColor === 'emerald' ? 'w-5 h-5 text-emerald-400' :
                              'w-5 h-5 text-purple-400'
                  })}
                </div>
                <div className="flex items-center">
                  <span className="text-slate-300 font-medium">{feature.text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Screen Content Components
const HistoryScreenContent = () => (
  <div className="space-y-3 overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-semibold text-sm">Activity History</h3>
      <div className="text-xs text-slate-400">24 records</div>
    </div>

    {[
      { type: 'increase', name: 'iPhone 13 Pro', diff: '+5', time: '2h ago' },
      { type: 'decrease', name: 'Samsung S23', diff: '-3', time: '4h ago' },
      { type: 'increase', name: 'AirPods Pro', diff: '+10', time: '1d ago' },
      { type: 'increase', name: 'Jeans ', diff: '+10', time: '1W ago' },
      { type: 'decrease', name: 'AirPods Pro', diff: '+10', time: '1d ago' },
      { type: 'increase', name: 'Car Belts', diff: '+1', time: '2d ago' },
      { type: 'decrease', name: 'Engine Oil', diff: '+10', time: '1d ago' },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.2 }}
        className="bg-white/5 rounded-lg p-3 border border-white/10"
      >
        <div className="flex items-start gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            item.type === 'increase' ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {item.type === 'increase' ? (
              <Plus className="w-4 h-4 text-emerald-400" />
            ) : (
              <Minus className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-white text-xs font-medium truncate">{item.name}</span>
              <span className={`text-xs font-semibold ${
                item.type === 'increase' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {item.diff}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-400">{item.time}</span>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const InventoryScreenContent = () => (
  <div className="space-y-3 overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-semibold text-sm">Inventory</h3>
      <div className="text-xs text-emerald-400">18 in stock</div>
    </div>


    {[
      { name: 'MacBook Pro M3', qty: 12, sold: 8, price: '€850,000', status: 'in' },
      { name: 'Dell XPS 15', qty: 3, sold: 2, price: '₦420,000', status: 'low' },
      { name: 'HP Pavilion', qty: 0, sold: 15, price: '$180,000', status: 'out' },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.2 }}
        className={`rounded-lg p-3 border ${
          item.status === 'out' ? 'bg-red-500/10 border-red-500/30' :
          item.status === 'low' ? 'bg-amber-500/10 border-amber-500/30' :
          'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white text-xs font-medium truncate mb-1">{item.name}</h4>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                item.status === 'out' ? 'bg-red-500/30 text-red-300' :
                item.status === 'low' ? 'bg-amber-500/30 text-amber-300' :
                'bg-emerald-500/30 text-emerald-300'
              }`}>
                {item.qty}
              </div>
              <span className="text-[10px] text-slate-400">in stock</span>
              <TrendingUp className="w-3 h-3 text-emerald-500 ml-auto" />
              <span className="text-[10px] text-slate-400">{item.sold} sold</span>
            </div>
            <div className="text-xs text-white font-semibold mt-1">{item.price}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </div>
      </motion.div>
    ))}
  </div>
);

const ProductScreenContent = () => (
  <div className="space-y-3 overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-semibold text-sm">Products</h3>
      <div className="text-xs text-purple-400">12 items</div>
    </div>

    {[
      { name: 'iPhone 15 Pro Max', qty: 8, price: '$1,200,000', unique: true, pending: false },
      { name: 'Sony WH-1000XM5', qty: 15, price: '₦145,000', unique: false, pending: true },
      { name: 'iPad Air M2', qty: 6, price: '€50,000', unique: true, pending: false },
      { name: 'Bottled Water', qty: 6, price: '₦80,000', Generic: true, pending: false },
      { name: 'Spaghetti', qty: 6, price: '€20,000', Generic: true, pending: true },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.2 }}
        className="relative bg-white/5 rounded-lg p-3 border border-white/10"
      >
        {item.pending && (
          <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-medium flex items-center gap-1">
            <Clock className="w-2 h-2" />
            Pending
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            item.unique ? 'bg-purple-500/20' : 'bg-indigo-500/20'
          }`}>
            {item.unique ? (
              <Box className="w-4 h-4 text-purple-400" />
            ) : (
              <Package className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white text-xs font-medium truncate mb-1">{item.name}</h4>
            {item.unique && (
              <div className="inline-block px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[8px] font-bold uppercase mb-1">
                Unique-Item
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-xs font-bold">
                {item.qty}
              </div>
              <span className="text-xs text-white font-semibold">{item.price}</span>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default function MockScreens() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Header */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
           
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Complete Business Intelligence {' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Management Suite
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-slate-400 mb-8">
              Professional inventory management designed for modern businesses. 
              Track stock, monitor sales, and manage your entire catalog with precision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mock Screens */}
      {mockupFeatures.map((mockup, index) => (
        <React.Fragment key={index}>
          <MockScreenCard mockup={mockup} index={index} />
          {index < mockupFeatures.length - 1 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          )}
        </React.Fragment>
      ))}

      {/* Bottom CTA */}
      
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-4 text-center"
        >
          
        </motion.div>
   
    </div>
  );
}