import { motion } from "framer-motion";

export function Card({ children, className = "", hover = true, delay = 0 }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={hover ? { scale: 1.02, boxShadow: "0 20px 40px rgba(0,255,159,0.1)" } : {}}
      className={`backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
