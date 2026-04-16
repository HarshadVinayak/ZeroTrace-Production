import { motion } from 'framer-motion';

export default function MobileAnalyze() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="p-4"
    >
      <h2 className="text-2xl font-bold mb-4">Analyze Purchases</h2>
      <div className="bg-theme-card border border-color rounded-3xl p-6 text-center shadow-sm">
        <p className="text-theme-secondary mb-4 text-sm">Paste a product URL or link your Swiggy/Amazon accounts to analyze impact.</p>
        <button className="w-full bg-theme-accent text-white py-4 rounded-2xl font-bold shadow-theme-glow active:scale-95 transition-transform">
          Connect Account
        </button>
      </div>
    </motion.div>
  );
}
