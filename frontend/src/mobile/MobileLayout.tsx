import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart2, CheckCircle, MessageSquare, User, Bell, Camera, ChevronLeft } from 'lucide-react';
import MobileDashboard from './pages/MobileDashboard';
import MobileAnalyze from './pages/MobileAnalyze';
import MobileHabits from './pages/MobileHabits';
import MobileChat from './pages/MobileChat';
import MobileProfile from './pages/MobileProfile';
import MobileScanner from './pages/MobileScanner';

function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/analyze', icon: BarChart2, label: 'Analyze' },
    { path: '/habits', icon: CheckCircle, label: 'Habits' },
    { path: '/chat', icon: MessageSquare, label: 'AI Coach' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-theme-base/90 backdrop-blur-xl border-t border-color z-50 px-2 pb-safe">
      <div className="flex justify-between h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className="flex-1 flex flex-col items-center justify-center relative touch-manipulation"
            >
              <motion.div whileTap={{ scale: 0.9 }}>
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-theme-accent' : 'text-theme-secondary'}`} />
              </motion.div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-theme-accent' : 'text-theme-secondary'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator" 
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-theme-accent rounded-b-full shadow-[0_0_10px_var(--accent-glow)]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function MobileHeader() {
  const location = useLocation();
  const isScanner = location.pathname === '/scanner';

  if (isScanner) return null;

  return (
    <header className="sticky top-0 z-40 bg-theme-main/80 backdrop-blur-xl border-b border-color px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-theme-accent flex items-center justify-center shadow-theme-glow">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-display font-black tracking-tight text-theme-primary">ZeroTrace</h1>
      </div>
      <button className="w-10 h-10 rounded-full bg-theme-card border border-color flex items-center justify-center relative touch-manipulation">
        <Bell className="w-5 h-5 text-theme-primary" />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-theme-main"></span>
      </button>
    </header>
  );
}

// Reusable Leaf icon since we use it in Header
function Leaf(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 14 6c3.22 0 6 2.78 6 6 0 3.86-3 7-7 7a7 7 0 0 1-2-12v12Z"/>
    </svg>
  );
}

export default function MobileLayout() {
  const location = useLocation();
  const isScanner = location.pathname === '/scanner';

  return (
    <div className="min-h-screen bg-theme-main text-theme-primary flex flex-col font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <MobileHeader />
      
      <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar scroll-smooth">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MobileDashboard />} />
            <Route path="/analyze" element={<MobileAnalyze />} />
            <Route path="/habits" element={<MobileHabits />} />
            <Route path="/chat" element={<MobileChat />} />
            <Route path="/profile" element={<MobileProfile />} />
            <Route path="/scanner" element={<MobileScanner />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!isScanner && <BottomNav />}
      
      {!isScanner && (
        <Link to="/scanner" className="fixed bottom-20 right-4 z-50 outline-none touch-manipulation">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-gradient-to-br from-theme-accent to-emerald-400 rounded-2xl shadow-[0_10px_25px_rgba(5,150,105,0.4)] flex items-center justify-center text-white"
          >
            <Camera className="w-6 h-6" />
          </motion.div>
        </Link>
      )}
    </div>
  );
}
