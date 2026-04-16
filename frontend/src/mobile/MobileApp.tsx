import { useEffect, useState } from 'react';
import MobileLayout from './MobileLayout';
import { ThemeContext, Toast } from '../App'; 
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

export default function MobileApp() {
  const [theme, setTheme] = useState(localStorage.getItem('zt_theme') || 'dark');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('zt_theme', theme);
    
    // Lock body scrolling for mobile web app feel
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const showToast = (message: string, type: 'success'|'error'|'info' = 'info') => {
    setToast({message, type});
    setTimeout(() => setToast(null), 3000);
  };

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
