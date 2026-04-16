import { motion } from 'framer-motion';

export default function MobileProfile() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-6">
      <div className="flex flex-col items-center justify-center mt-6">
        <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-theme-accent shadow-[0_0_20px_var(--accent-glow)] mb-4"></div>
        <h2 className="text-2xl font-bold">Harsh V.</h2>
        <p className="text-theme-secondary text-sm">Level 3 Eco Hero</p>
      </div>

      <div className="bg-theme-card border border-color rounded-3xl p-5 space-y-4">
        <h3 className="font-bold text-lg mb-2">Settings</h3>
        <div className="flex justify-between items-center py-2 border-b border-color">
           <span>Push Notifications</span>
           <div className="w-12 h-6 bg-theme-accent rounded-full relative">
             <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
           </div>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-color">
           <span>Dark Mode</span>
           <div className="w-12 h-6 bg-theme-accent rounded-full relative">
             <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
           </div>
        </div>
        <button className="w-full py-3 text-red-500 font-bold mt-4 bg-red-500/10 rounded-xl">
           Logout
        </button>
      </div>
    </motion.div>
  );
}
