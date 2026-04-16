import { useEffect, useState } from 'react';
import MobileLayout from './MobileLayout';
import { ThemeContext, Toast } from '../App';
import { supabase } from '../lib/supabase';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export default function MobileApp() {
  const [theme, setTheme] = useState(localStorage.getItem('zt_theme') || 'dark');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('zt_theme', theme);

    // Lock body scrolling for mobile web app feel
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; }
  }, [theme]);

  // Supabase session sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#07131f] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
        <MobileLayout />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

