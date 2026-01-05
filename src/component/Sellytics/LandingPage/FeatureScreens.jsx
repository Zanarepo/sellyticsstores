import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, BarChart3, Package, TrendingUp, DollarSign,
  AlertTriangle, Users, PieChart,  Bell,
 ArrowUp, Clock, Box
} from 'lucide-react';

const screens = [
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Real-time insights into your inventory value, profit margins, and stock health.',
    icon: BarChart3,
    color: 'indigo',
  },
  {
    id: 'performance',
    title: 'Product Performance',
    description: 'Track individual product sales, revenue, and identify your top performers.',
    icon: TrendingUp,
    color: 'emerald',
  },
  {
    id: 'details',
    title: 'Product Details',
    description: 'Deep dive into stock levels, sales trends, and profitability for each item.',
    icon: Package,
    color: 'purple',
  },
];

// Analytics Screen Mockup
const AnalyticsScreen = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 overflow-y-auto">
    {/* Header */}
    <div className="text-xs font-semibold text-slate-900 dark:text-white mb-3">
      Inventory Evaluation
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      {[
        { label: 'Cost Value', value: '₦2.4M', icon: DollarSign, color: 'indigo' },
        { label: 'Retail Value', value: '₦3.8M', icon: TrendingUp, color: 'emerald' },
        { label: 'Total Units', value: '1,247', icon: Package, color: 'purple' },
        { label: 'Margin', value: '36.8%', icon: ArrowUp, color: 'blue' },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700"
        >
          <div className={`w-6 h-6 rounded-md bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center mb-1`}>
            <stat.icon className={`w-3 h-3 text-${stat.color}-600`} />
          </div>
          <div className="text-[10px] text-slate-500">{stat.label}</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</div>
        </motion.div>
      ))}
    </div>

    {/* Alerts */}
    <div className="space-y-1.5 mb-3">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-red-700 dark:text-red-300 truncate">
            8 products out of stock
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
      >
        <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-amber-700 dark:text-amber-300 truncate">
            12 products low on stock
          </div>
        </div>
      </motion.div>
    </div>

    {/* Chart Placeholder */}
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 mb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <BarChart3 className="w-3 h-3 text-indigo-600" />
        <div className="text-[10px] font-semibold text-slate-900 dark:text-white">
          Top Products by Value
        </div>
      </div>
      <div className="space-y-1.5">
        {[60, 45, 30].map((width, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="text-[9px] text-slate-500 w-12 truncate">MacBook {i + 1}</div>
            <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Pie Chart */}
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-1.5 mb-2">
        <PieChart className="w-3 h-3 text-indigo-600" />
        <div className="text-[10px] font-semibold text-slate-900 dark:text-white">
          Category Distribution
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            {[
              { color: '#6366f1', offset: 0, percent: 35 },
              { color: '#22c55e', offset: 35, percent: 25 },
              { color: '#f59e0b', offset: 60, percent: 20 },
              { color: '#ef4444', offset: 80, percent: 20 },
            ].map((segment, i) => {
              const radius = 32;
              const circumference = 2 * Math.PI * radius;
              const dash = (segment.percent / 100) * circumference;
              const gap = circumference - dash;
              const offset = -(segment.offset / 100) * circumference;

              return (
                <motion.circle
                  key={i}
                  cx="40"
                  cy="40"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="8"
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={offset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${dash} ${gap}` }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  </div>
);

// Performance Screen Mockup
const PerformanceScreen = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 overflow-y-auto">
    {/* Header */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">iPhone 13 Pro</div>
          <div className="text-[9px] text-slate-500">Performance Overview</div>
        </div>
      </div>
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-4 gap-2 mb-3">
      {[
        { label: 'Sold', value: '124', icon: Package, color: 'blue' },
        { label: 'Revenue', value: '₦840K', icon: DollarSign, color: 'emerald' },
        { label: 'Stock', value: '45', icon: TrendingUp, color: 'purple' },
        { label: 'Value', value: '₦180K', icon: DollarSign, color: 'orange' },
      ].map((metric, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <metric.icon className={`w-3 h-3 mx-auto mb-1 text-${metric.color}-600`} />
          <div className="text-[9px] text-slate-500 mb-0.5">{metric.label}</div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">{metric.value}</div>
        </motion.div>
      ))}
    </div>

    {/* Pricing */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="text-[9px] text-slate-500 mb-1">Purchase Price</div>
        <div className="text-sm font-bold text-slate-900 dark:text-white">₦380,000</div>
      </div>
      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="text-[9px] text-slate-500 mb-1">Selling Price</div>
        <div className="text-sm font-bold text-emerald-600">₦420,000</div>
      </div>
    </div>

    {/* Top Sellers */}
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center gap-1.5 mb-2">
        <Users className="w-3 h-3 text-indigo-600" />
        <div className="text-[10px] font-semibold text-slate-900 dark:text-white">Top Sellers</div>
      </div>
      <div className="space-y-1.5">
        {[
          { name: 'Prince Zana', qty: 45, rank: 1 },
          { name: 'Bridget', qty: 32, rank: 2 },
          { name: 'Olaoluwa', qty: 28, rank: 3 },
        ].map((seller, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-md"
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                seller.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                seller.rank === 2 ? 'bg-slate-100 text-slate-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {seller.rank}
              </div>
              <span className="text-[9px] font-medium text-slate-900 dark:text-white truncate">
                {seller.name}
              </span>
            </div>
            <span className="text-[9px] font-bold text-indigo-600">{seller.qty}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Details Screen Mockup
const DetailsScreen = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 overflow-y-auto">
    {/* Header */}
    <div className="flex items-start gap-2 mb-3">
      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
        <Box className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <div className="text-xs font-bold text-slate-900 dark:text-white">MacBook Pro 14"</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9px] text-slate-500">Electronics</span>
          <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[8px] font-medium rounded-full">
            Trackable
          </span>
        </div>
      </div>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-3 gap-2 mb-3">
      {[
        { value: '23', label: 'In Stock', color: 'emerald' },
        { value: '67', label: 'Sold', color: 'blue' },
        { value: '₦520K', label: 'Total', color: 'indigo' },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <div className={`text-base font-bold text-${stat.color}-600`}>{stat.value}</div>
          <div className="text-[9px] text-slate-500">{stat.label}</div>
        </motion.div>
      ))}
    </div>

    {/* Tabs */}
    <div className="flex gap-1 p-1 mb-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
      {['Overview', 'Analytics', 'History'].map((tab, i) => (
        <div
          key={i}
          className={`flex-1 py-1.5 rounded-md text-[9px] font-medium text-center ${
            i === 0 
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white' 
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {tab}
        </div>
      ))}
    </div>

    {/* Content */}
    <div className="space-y-2">
      {/* Pricing Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1 text-slate-500 text-[9px] mb-1">
            <DollarSign className="w-2.5 h-2.5" />
            Cost Price
          </div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white">₦480,000</div>
        </div>
        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1 text-slate-500 text-[9px] mb-1">
            <TrendingUp className="w-2.5 h-2.5" />
            Margin
          </div>
          <div className="text-xs font-semibold text-emerald-600">8.3%</div>
        </div>
      </div>

      {/* Stock Alert */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-2 rounded-lg flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
      >
        <Clock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
        <div>
          <div className="text-[10px] font-medium text-slate-900 dark:text-white">
            ~34 days of stock remaining
          </div>
          <div className="text-[8px] text-slate-500">Based on 30-day average</div>
        </div>
      </motion.div>

      {/* Mini Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
        <div className="text-[9px] font-medium text-slate-900 dark:text-white mb-2">
          Sales Trend
        </div>
        <div className="relative h-16">
          <svg className="w-full h-full" viewBox="0 0 200 60">
            <motion.path
              d="M 0,50 L 40,35 L 80,40 L 120,20 L 160,25 L 200,15"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            />
          </svg>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <div className="text-[9px] text-emerald-600 mb-1">Total Revenue</div>
          <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">₦34.8M</div>
        </div>
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <div className="text-[9px] text-indigo-600 mb-1">Total Profit</div>
          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">₦2.7M</div>
        </div>
      </div>
    </div>
  </div>
);

export default function AppScreensShowcase() {
  const [activeScreen, setActiveScreen] = useState('analytics');

  const getScreenComponent = () => {
    switch (activeScreen) {
      case 'analytics': return <AnalyticsScreen />;
      case 'performance': return <PerformanceScreen />;
      case 'details': return <DetailsScreen />;
      default: return <AnalyticsScreen />;
    }
  };

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden bg-slate-900">
      {/* Background */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />

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
            App Preview
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-4">
            Experience the{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Future
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 px-4">
            See exactly what you'll get. Powerful insights, beautiful design, 
            all optimized for your mobile device.
          </p>
        </motion.div>

        {/* Screen Selector */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          {screens.map((screen, index) => (
            <motion.button
              key={screen.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveScreen(screen.id)}
              className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                activeScreen === screen.id
                  ? `bg-gradient-to-r from-${screen.color}-600 to-${screen.color}-700 text-white shadow-lg shadow-${screen.color}-500/25`
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <screen.icon className="w-5 h-5" />
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold">{screen.title}</div>
                <div className="text-xs opacity-80">{screen.description.split('.')[0]}</div>
              </div>
              <div className="text-sm font-semibold sm:hidden">{screen.title}</div>
            </motion.button>
          ))}
        </div>

        {/* Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="relative w-full max-w-[320px] sm:max-w-[360px]">
            {/* Phone Frame */}
            <div className="relative bg-slate-950 rounded-[2.5rem] sm:rounded-[3rem] border-[10px] sm:border-[12px] border-slate-800 shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 sm:w-40 h-7 sm:h-8 bg-slate-800 rounded-b-3xl z-20" />
              
              {/* Screen Container */}
              <div className="relative aspect-[9/19] bg-slate-900 overflow-hidden">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 bg-slate-900 z-10 flex items-center justify-between px-6 text-white">
                  <div className="text-[10px] sm:text-xs font-medium">9:41</div>
                  <div className="flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    <div className="w-4 h-2 border border-white/50 rounded-sm relative">
                      <div className="absolute inset-0.5 bg-white rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* Screen Content with Animation */}
                <div className="absolute inset-0 pt-10 sm:pt-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeScreen}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full"
                    >
                      {getScreenComponent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Floating Features */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -right-4 top-1/4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-3 backdrop-blur-xl hidden sm:block"
            >
              <Smartphone className="w-5 h-5 text-indigo-400" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute -left-4 bottom-1/4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl p-3 backdrop-blur-xl hidden sm:block"
            >
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 sm:mt-12 max-w-2xl mx-auto"
        >
          <p className="text-slate-400 text-sm sm:text-base px-4">
            {screens.find(s => s.id === activeScreen)?.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}