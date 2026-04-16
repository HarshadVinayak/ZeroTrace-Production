import { motion } from 'framer-motion';
import { useContext } from 'react';
import { ThemeContext } from '../../App';
import { Moon, Sun, LogOut } from 'lucide-react';

export default function MobileProfile() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleLogout = async () => {
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4 space-y-6 pb-10"
    >
      {/* Avatar */}
      <div className="flex flex-col items-center justify-center mt-6 mb-2">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-theme-accent to-teal-400 flex items-center justify-center shadow-[0_0_30px_var(--accent-glow)] mb-4 text-3xl font-black text-slate-900">
          Z
        </div>
        <h2 className="text-2xl font-bold text-theme-primary">ZeroTrace User</h2>
        <p className="text-theme-secondary text-sm">Level 3 Eco Hero 🌿</p>
      </div>

      {/* Settings */}
      <div className="bg-theme-card border border-color rounded-3xl p-5 space-y-1">
        <h3 className="font-bold text-lg mb-3 text-theme-primary">Preferences</h3>

        {/* Dark mode toggle */}
        <div className="flex justify-between items-center py-3 border-b border-color">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-theme-accent" /> : <Sun className="w-5 h-5 text-theme-accent" />}
            <span className="font-medium text-theme-primary">Dark Mode</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-theme-accent' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 shadow-sm ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Notifications (static toggle, can wire Supabase later) */}
        <div className="flex justify-between items-center py-3">
          <span className="font-medium text-theme-primary">Push Notifications</span>
          <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded-full relative">
            <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="bg-theme-card border border-color rounded-3xl p-5 text-center">
        <p className="text-theme-secondary text-sm">ZeroTrace v3.0</p>
        <p className="text-theme-secondary text-xs mt-1">AI-Powered Sustainability Platform</p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 text-red-500 font-bold bg-red-500/10 border border-red-500/20 rounded-2xl active:scale-95 transition-transform"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </motion.div>
  );
}
