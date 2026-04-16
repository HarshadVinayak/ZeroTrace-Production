import { motion } from 'framer-motion';
import { Camera, X, ScanLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MobileScanner() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-afe left-4 top-8 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Placeholder for camera feed */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366')] bg-cover bg-center" />
        
        {/* Scanner Overlay */}
        <div className="relative z-10 w-64 h-64 border-2 border-theme-accent/50 rounded-3xl overflow-hidden before:absolute before:inset-0 before:bg-theme-accent/10">
           <motion.div 
             animate={{ top: ['0%', '100%', '0%'] }} 
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="absolute left-0 right-0 h-1 bg-theme-accent shadow-[0_0_15px_var(--accent-glow)]"
           />
           <ScanLine className="w-12 h-12 text-theme-accent/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="h-40 bg-black pt-8 flex items-start justify-center">
        <button className="w-16 h-16 rounded-full border-4 border-theme-accent flex items-center justify-center bg-white/10 active:scale-95 transition-transform touch-manipulation">
          <div className="w-12 h-12 bg-white rounded-full"></div>
        </button>
      </div>
    </motion.div>
  );
}
