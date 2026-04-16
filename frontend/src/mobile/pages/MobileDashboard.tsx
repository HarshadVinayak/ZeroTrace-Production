import { motion } from 'framer-motion';
import { Target, Zap, ZapOff, CheckCircle, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export default function MobileDashboard() {
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    fetch(`${API_BASE}/profile/demo_user`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => setProfile({ score: 85, level: 3, xp: 450, weekly_trend: -5 }));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 space-y-6"
    >
      {/* Score Card - Large and Centered */}
      <div className="bg-theme-card border border-color rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-theme-accent/20 blur-3xl rounded-full"></div>
        <p className="text-sm font-bold text-theme-secondary uppercase tracking-widest mb-2">Impact Index</p>
        <div className="text-6xl font-display font-black text-theme-primary mb-1">
          {profile ? profile.score : '--'}
        </div>
        <p className="text-theme-accent font-medium text-sm flex items-center justify-center gap-1">
          <TrendingDownIcon className="w-4 h-4" /> 5% better than last week
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-bold text-lg mb-3">Quick Log</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform touch-manipulation">
            <Zap className="w-8 h-8" />
            <span className="font-bold text-sm">Used Plastic</span>
          </button>
          <button className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform touch-manipulation">
            <CheckCircle className="w-8 h-8" />
            <span className="font-bold text-sm">Eco Choice</span>
          </button>
        </div>
      </div>

      {/* Weekly Challenge */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl p-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-theme-primary leading-tight">Zero-Waste Week</h3>
            <p className="text-sm text-theme-secondary mt-1 mb-3">Avoid single-use plastics for 7 days straight.</p>
            <div className="w-full bg-black/10 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full w-4/7" style={{ width: '57%' }}></div>
            </div>
            <p className="text-xs text-indigo-500 font-bold mt-2">4 / 7 Days Complete</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TrendingDownIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>
    </svg>
  );
}
