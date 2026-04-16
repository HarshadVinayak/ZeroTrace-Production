import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

type Msg = { role: 'user' | 'ai'; text: string };

export default function MobileChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: 'Hi! I am your AI Eco Coach powered by real AI. What would you like to know about reducing your plastic footprint today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'mobile_user', message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply || 'No response received.' }]);
    } catch (e: any) {
      setError('AI temporarily unavailable. Please try again.');
      setMessages(prev => [...prev, { role: 'ai', text: '⚠️ I am having trouble connecting right now. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-[calc(100dvh-130px)]"
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
              m.role === 'user'
                ? 'bg-theme-accent text-white rounded-br-sm'
                : 'bg-theme-card border border-color rounded-bl-sm shadow-sm text-theme-primary'
            }`}>
              {m.role === 'ai' && <Sparkles className="w-3 h-3 text-theme-accent mb-1.5 opacity-70" />}
              {m.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-theme-card border border-color rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-theme-accent rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 text-center px-4 pb-1">{error}</p>
      )}

      {/* Input */}
      <div className="p-3 bg-theme-main border-t border-color flex gap-2 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about plastic, eco tips..."
          className="flex-1 bg-theme-card border border-color text-theme-primary rounded-full px-4 py-3 text-sm outline-none focus:border-theme-accent transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="w-12 h-12 bg-theme-accent text-white rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 shrink-0"
        >
          {loading ? <Zap className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    </motion.div>
  );
}
