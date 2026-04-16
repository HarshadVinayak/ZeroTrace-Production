import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check } from 'lucide-react';

export default function MobileHabits() {
  const [habits, setHabits] = useState([
    { id: 1, name: "Used Canvas Bag", done: false },
    { id: 2, name: "No Plastic Cutlery", done: true },
    { id: 3, name: "Refilled Water Bottle", done: false }
  ]);

  const toggle = (id: number) => setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
      <h2 className="text-2xl font-bold mb-4">Daily Habits</h2>
      <div className="space-y-3">
        {habits.map(habit => (
          <div key={habit.id} onClick={() => toggle(habit.id)} className={`p-4 rounded-2xl border transition-colors flex justify-between items-center ${habit.done ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-theme-card border-color'}`}>
            <span className={`font-semibold ${habit.done ? 'text-emerald-500 line-through opacity-80' : 'text-theme-primary'}`}>{habit.name}</span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${habit.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-theme-secondary text-transparent'}`}>
              <Check className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
