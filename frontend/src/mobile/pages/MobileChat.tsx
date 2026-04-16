import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function MobileChat() {
  const [messages, setMessages] = useState([{ role: 'ai', text: 'Hi! I am your AI Eco Coach. Need help reducing your footprint today?' }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Based on your data, trying reusable alternatives for delivery reduces 20% of your footprint!' }]);
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-[calc(100vh-130px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] ${m.role === 'user' ? 'bg-theme-accent text-white rounded-br-sm' : 'bg-theme-card border border-color rounded-bl-sm shadow-sm'}`}>
               {m.role === 'ai' && <Sparkles className="w-3 h-3 text-theme-accent mb-1" />}
               {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 bg-theme-main border-t border-color flex gap-2">
        <input 
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..." 
          className="flex-1 bg-theme-card border border-color text-theme-primary rounded-full px-4 outline-none focus:border-theme-accent"
        />
        <button onClick={handleSend} className="w-12 h-12 bg-theme-accent text-white rounded-full flex items-center justify-center active:scale-90 transition-transform">
          <Send className="w-5 h-5 ml-1" />
        </button>
      </div>
    </motion.div>
  );
}
