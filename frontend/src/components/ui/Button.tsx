import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  disabled?: boolean;
}

export function Button({ children, onClick, variant = "primary", className = "", disabled }: ButtonProps) {
  const base = "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 justify-center shadow-lg active:scale-95 text-sm uppercase tracking-wide";
  const variants = {
    primary: "bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-[0_0_15px_rgba(20,184,166,0.4)] disabled:bg-slate-700",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
    danger: "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 shadow-none border border-transparent"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </motion.button>
  );
}
