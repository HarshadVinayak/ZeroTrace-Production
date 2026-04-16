import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Leaf, LayoutDashboard, Users, Send, Target, Zap, AlertTriangle, CheckCircle2, TrendingDown, Settings as SettingsIcon, Hash, Save, Bell, Lock, Palette, Camera, Star, Award, Fingerprint, Plus, Moon, Sun, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase, signOut } from './lib/supabase';
import Login from './pages/Login';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const STAGGER_CHILDREN = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 }
};

const GLASS_PANEL = "backdrop-blur-2xl bg-theme-card border border-color rounded-[2.5rem] p-8 shadow-theme-glow transition-all";
const BUTTON_PRIMARY = "flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-theme-accent text-white shadow-theme-glow hover:-translate-y-1 transition-all active:scale-95";

export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });

export function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) {
  const bg = type === 'error' ? 'bg-red-500/90' : type === 'success' ? 'bg-[#00ff9f]/90 text-slate-900' : 'bg-slate-800/90 text-white';
  return (
    <motion.div initial={{ opacity: 0, x: 50, y: -20 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md font-medium text-sm flex items-center gap-4 border border-white/20 ${bg}`}>
      {type === 'error' ? <AlertTriangle className="w-5 h-5" /> : type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
      {message}
      <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}




// AuthPage replaced by /src/pages/Login.tsx with real Supabase auth

// 1. DASHBOARD COMPONENT - Massively Upgraded
function Dashboard() {
  const [health, setHealth] = useState<any>(null);
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [globalImpact, setGlobalImpact] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = () => {
    fetch(`${API_BASE}/profile/demo_user`).then(r=>r.json()).then(data=>{setProfile(data); setProfileLoading(false);}).catch(()=>{setProfileLoading(false);});
  };

  useEffect(() => {
    fetch(`${API_BASE}/health`).then(r => r.json()).then(setHealth).catch(console.error);
    fetchProfile();
    fetch(`${API_BASE}/global-impact`).then(r=>r.json()).then(setGlobalImpact).catch(()=>{});
  }, []);

  const logAction = async (type: string) => {
    try {
      await fetch(`${API_BASE}/action`, { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ action_type: type, user_id: 'demo_user'})});
      fetchProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const send = async () => {
    if (!chat.trim()) return;
    const msg = chat;
    setChat("");
    setMessages(prev => [...prev, {role: 'user', text: msg}]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ message: msg, user_id: 'demo_user' })});
      const data = await res.json();
      setMessages(prev => [...prev, {role: 'ai', text: data.response || "No response received"}]);
    } catch {
      setMessages(prev => [...prev, {role: 'ai', text: "AI unavailable. Based on memory, avoid food delivery packaging."}]);
    } finally { setLoading(false); }
  };


  return (
    <motion.div 
      initial="initial" animate="animate" variants={STAGGER_CHILDREN}
      className="max-w-6xl mx-auto space-y-10 relative z-10 pt-10 pb-20 px-6"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <motion.div variants={FADE_UP}>
          <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white via-emerald-400 to-teal-500 font-display tracking-tighter leading-none italic uppercase">
            Zero <br/> Trace
          </h1>
          <p className="text-emerald-500/60 font-black tracking-[0.4em] uppercase text-[10px] mt-4 flex items-center gap-2">
            <span className="w-8 h-px bg-emerald-500/30" /> Real-time Impact Engine
          </p>
        </motion.div>
        
        {health && (
          <motion.div variants={FADE_UP} className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff9f] shadow-[0_0_15px_#00ff9f] animate-pulse"></span>
              <span className="text-white text-xs font-black uppercase tracking-widest">Neural Link Active</span>
            </div>
            {globalImpact && (
              <div className="px-6 py-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                🌍 Global: {globalImpact.total_saved_kg.toLocaleString()}kg Saved
              </div>
            )}
          </motion.div>
        )}
      </header>

      {/* Quick Action Tracking */}
      <motion.div variants={FADE_UP} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { type: 'plastic_bottle', label: 'Plastic Bottle', color: 'emerald', icon: Leaf },
          { type: 'ordered_food', label: 'Food Delivery', color: 'orange', icon: Zap },
          { type: 'packaged_item', label: 'Packaged Item', color: 'purple', icon: Activity }
        ].map((action, i) => (
          <button 
            key={i} 
            onClick={() => logAction(action.type)} 
            className={`group relative flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 shadow-xl transition-all hover:-translate-y-2 active:scale-95 overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-${action.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${action.color}-500/10 flex items-center justify-center border border-${action.color}-500/20 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-6 h-6 text-${action.color}-400`} />
              </div>
              <span className="text-white font-black tracking-tight">{action.label}</span>
            </div>
            <Plus className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div variants={FADE_UP} className={`lg:col-span-8 ${GLASS_PANEL} relative overflow-hidden flex flex-col p-10 min-h-[600px] glass-shine`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 mb-4">
            <Fingerprint className="w-5 h-5 text-teal-400" /> Auto Insights & Coach AI
          </h2>
          {/* AI Auto Insights Block */}
          <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            <div className="bg-[#1e293b]/50 border border-slate-700/50 p-4 rounded-2xl">
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest block mb-1">Today's Insight</span>
              <p className="text-slate-300 text-sm">You are 15% more likely to order food on Fridays. Pre-cook tonight.</p>
            </div>
            <div className="bg-[#1e293b]/50 border border-slate-700/50 p-4 rounded-2xl">
              <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-1">Weekly Problem Area</span>
              <p className="text-slate-300 text-sm">{profile?.top_problem || "Plastic Bottles"}</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Leaf className="w-12 h-12 mb-4 opacity-20" />
                <p>Chat with your Planner AI or ask about a product.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-md ${m.role === 'user' ? 'bg-[#1e293b] text-white border border-[#38bdf8]/20' : 'bg-[#0f172a] text-slate-300 border border-[#2dd4bf]/20'}`}>
                    {m.text}
                  </div>
                </motion.div>
              ))
            )}
            {loading && (
              <div className="bg-[#0f172a] w-24 rounded-2xl px-5 py-4 border border-[#2dd4bf]/20 flex gap-2 items-center">
                 <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse delay-75"></span>
                 <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse delay-150"></span>
              </div>
            )}
          </div>
          <div className="flex gap-3 relative z-10 mt-auto">
            <input 
              value={chat} onKeyDown={e => e.key === 'Enter' && send()} onChange={e => setChat(e.target.value)} 
              placeholder="Ask Coach AI for a reduction strategy..."
              className="flex-1 bg-[#1e293b] text-white rounded-xl px-5 py-4 outline-none border border-slate-700 focus:border-[#00ff9f]/50 transition-colors shadow-inner"
            />
            <button onClick={send} className="px-5 py-4 rounded-xl bg-[#00ff9f] text-[#0f172a] hover:bg-[#2dd4bf] transition-all font-bold shadow-[0_0_15px_rgba(0,255,159,0.3)]">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="fixed bottom-8 right-8 w-80 bg-slate-900/90 border border-[#00ff9f]/50 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,255,159,0.2)] backdrop-blur-2xl z-50 animate-bounce-slow">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#00ff9f]/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#00ff9f] animate-pulse" />
              </div>
              <span className="font-black text-white tracking-tight">Eco Companion</span>
           </div>
           <p className="text-sm text-slate-300 font-medium leading-relaxed">
             Based on your behavior, you usually order food around this time. <strong className="text-white">Remember to request NO plastic cutlery!</strong>
           </p>
        </div>

        <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{delay: 0.2}} className={`lg:col-span-4 ${GLASS_PANEL} flex flex-col`}>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xs font-bold text-teal-400 tracking-widest uppercase">Live Profile</h3>
              {profile && (
                <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full text-yellow-500 text-xs font-bold">
                  <Star className="w-3 h-3" /> Lvl {profile.level || 1} • {profile.xp || 0} XP
                </div>
              )}
            </div>
            
            {profileLoading ? (
               <div className="flex justify-center py-10 opacity-50"><Zap className="animate-spin w-8 h-8 text-teal-400" /></div>
            ) : (
               <>
                <div className="text-7xl font-display font-extrabold text-white mb-2 drop-shadow-md">{(profile?.score || 85)}<span className="text-2xl text-slate-500">/100</span></div>
                <p className="text-slate-400 text-sm mb-4">Your real sustainability index.</p>
                <div className="mb-6 flex gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 shadow-inner">
                    Risk: {profile?.risk_level || 'Medium'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#1e293b] text-slate-300 border border-slate-700 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-green-400"/> {profile?.weekly_trend || -5}% Trend
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner flex items-center gap-1">
                    <Zap className="w-3 h-3" /> External: 84/100
                  </span>
                </div>
                
                <h4 className="text-sm font-semibold text-white mb-4 mt-6 flex items-center gap-2"><Activity className="w-4 h-4 text-[#00ff9f]"/> Impact History</h4>
                <div className="h-40 w-full mb-6 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[ { name: 'Mon', score: 65 }, { name: 'Tue', score: 68 }, { name: 'Wed', score: 74 }, { name: 'Thu', score: 72 }, { name: 'Fri', score: 85 } ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="score" stroke="#00ff9f" strokeWidth={3} dot={{ fill: '#00ff9f', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-[#00ff9f]"/> Smart Action Tiers</h4>
                <div className="space-y-3">
                  {profile?.nudges ? profile.nudges.slice(0,2).map((nudge: string, i: number) => (
                    <div key={i} className="bg-[#1e293b]/80 rounded-xl p-4 border border-slate-700/50 shadow-md">
                      <div className="text-slate-200 text-sm leading-relaxed flex items-start gap-3 font-medium">
                        <Leaf className="w-4 h-4 text-teal-400 mt-1 flex-shrink-0" /> {nudge}
                      </div>
                    </div>
                  )) : (
                    <div className="bg-[#1e293b]/80 rounded-xl p-4 border border-slate-700/50 text-slate-200 text-sm shadow-md">
                      Switching to reusable bottles cuts usage by 40%.
                    </div>
                  )}
                </div>
               </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// 2. DISCORD-STYLE REALTIME CHAT COMPONENT (SUPABASE BACKED)
function CommunityChat({ session }: { session: any }) {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const username = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "EcoHero";

  const channels = ["general", "eco-tips", "challenges", "reuse-ideas"];

  // Fetch initial messages and set up subscription
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', activeChannel)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (!error && data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`public:messages:channel=${activeChannel}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel=eq.${activeChannel}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const newMessage = {
      channel: activeChannel,
      user_id: session?.user?.id,
      username: username,
      message: input,
      created_at: new Date().toISOString()
    };
    
    setInput("");
    const { error } = await supabase.from('messages').insert([newMessage]);
    if (error) console.error("Error sending message:", error);
  };

  const toggleLike = async (messageId: string) => {
    // Basic like logic: increment likes_count in DB
    const { error } = await supabase.rpc('increment_likes', { row_id: messageId });
    if (error) console.error("Error liking message:", error);
  };

  return (
    <div className="max-w-6xl mx-auto h-[85vh] relative z-10 pt-10 px-6 flex flex-col">
      <h1 className="text-4xl font-bold text-white font-display mb-6 border-b border-slate-800 pb-4">Social Hub & Profiles</h1>
      <div className={`${GLASS_PANEL} flex-1 p-0 overflow-hidden flex shadow-2xl`}>
        <div className="w-64 bg-[#0f172a]/90 border-r border-slate-700/50 p-4 flex flex-col">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Global Channels</h2>
          <div className="space-y-1">
            {channels.map(c => (
              <button key={c} onClick={() => setActiveChannel(c)} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeChannel === c ? 'bg-teal-500/20 text-teal-400 shadow-inner' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                <Hash className="w-4 h-4 opacity-80" /> {c}
              </button>
            ))}
          </div>
          <div className="mt-auto p-4 bg-slate-800/40 rounded-xl flex items-center gap-3 border border-slate-700/50 cursor-pointer hover:bg-slate-800/60 transition-colors">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff9f] to-teal-600 flex items-center justify-center text-sm font-bold text-[#04111f] shadow-md">
               {username.substring(0,2).toUpperCase()}
             </div>
             <div className="overflow-hidden">
                <div className="text-sm text-white font-bold truncate">{username}</div>
                <div className="text-xs text-yellow-400 font-medium">Lvl 3 • Online</div>
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#0b1320]/60 relative">
          <div className="p-4 border-b border-slate-700/50 shadow-sm flex items-center gap-3 text-white font-extrabold backdrop-blur-md">
            <Hash className="w-5 h-5 text-[#00ff9f]" /> {activeChannel} 
            <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full ml-auto">12 Online</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 font-medium">
                Welcome to #{activeChannel}! Be the first to spark an idea.
              </div>
            ) : (
              messages.map((msg, i) => {
                 const isMe = msg.user_id === session?.user?.id;
                 const isAI = msg.username === "AI Auto-Reply";
                 return (
                   <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} key={msg.id || i} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-lg border ${isAI ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-300'}`}>
                      {isAI ? <Zap className="w-4 h-4"/> : msg.username.substring(0,2).toUpperCase()}
                    </div>
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1 px-1">
                         <span className={`text-sm font-extrabold ${isAI ? 'text-indigo-400' : 'text-slate-200'}`}>{msg.username} {isAI && '✓'}</span>
                         <span className="text-xs text-slate-500">{new Date(msg.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`px-5 py-3 rounded-2xl max-w-2xl text-[15px] shadow-md ${isMe ? 'bg-teal-600 border border-teal-500/50 text-white rounded-tr-none' : isAI ? 'bg-indigo-900/40 border border-indigo-500/30 text-indigo-100 rounded-tl-none' : 'bg-[#1e293b] border border-slate-700 text-slate-200 rounded-tl-none'}`}>
                        {msg.message}
                      </div>
                      {!isAI && (
                        <div className={`flex gap-2 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'} w-full px-1`}>
                           <span onClick={() => toggleLike(msg.id)} className="text-slate-500 hover:text-red-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 active:scale-95">❤️ {msg.likes_count || ''} Like</span>
                           <span className="text-slate-500 hover:text-teal-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-2 active:scale-95">💬 Reply</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-[#0b1320] border-t border-slate-700/50">
            <div className="flex gap-3 bg-[#1e293b] p-3 rounded-2xl border border-slate-600 shadow-inner focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder={`Message #${activeChannel}`} className="flex-1 bg-transparent text-white px-2 outline-none font-medium placeholder:text-slate-500" />
              <button onClick={send} className="p-2.5 rounded-xl bg-teal-500 text-slate-900 hover:bg-teal-400 font-bold shadow-md transition-transform hover:scale-105 active:scale-95"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. SMART PLASTIC SCANNER
function SmartScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => { if(videoRef.current) videoRef.current.srcObject = stream; })
      .catch(console.error);
    return () => {
      if(videoRef.current?.srcObject) {
         const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
         tracks.forEach(t=>t.stop());
      }
    };
  }, []);

  const capture = async () => {
    if (!videoRef.current) return;
    setLoading(true);
    
    // Draw current frame to canvas
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setLoading(false); return; }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];

    try {
      const res = await fetch(`${API_BASE}/scan-product`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Image })
      });
      if (!res.ok) throw new Error("API Error");
      setResult(await res.json());
    } catch {
      setResult({ product_name: "AI Unavailable", plastic_level: "unknown", score: 0, verdict: "Error", alternatives: [], recommendation: "Vision API is temporarily down."});
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10 pt-10 pb-20 px-6">
      <h1 className="text-4xl font-bold text-white font-display flex items-center gap-3"><Camera className="text-teal-400 w-8 h-8" /> Smart Plastic Scanner</h1>
      
      {!result ? (
        <div className={`${GLASS_PANEL} flex flex-col items-center p-8 relative overflow-hidden`}>
          <div className="w-full h-[400px] bg-black rounded-3xl overflow-hidden relative shadow-2xl border-2 border-slate-700">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 border-4 border-dashed border-[#00ff9f]/50 rounded-3xl pointer-events-none m-8 animate-pulse" />
            
            {loading && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                 <Zap className="w-16 h-16 text-[#00ff9f] animate-spin mb-4" />
                 <h3 className="text-2xl font-bold text-white tracking-widest">ANALYZING PLASTIC...</h3>
              </div>
            )}
          </div>
          
          <button onClick={capture} disabled={loading} className="mt-8 px-12 py-5 rounded-full bg-gradient-to-r from-[#00ff9f] to-teal-500 text-slate-900 font-extrabold text-xl shadow-[0_0_30px_rgba(0,255,159,0.5)] hover:scale-105 active:scale-95 transition-all">
            {loading ? "Scanning..." : "CAPTURE PRODUCT"}
          </button>
        </div>
      ) : (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className={GLASS_PANEL}>
          <div className="flex justify-between items-start border-b border-slate-700/50 pb-6 mb-6">
             <div>
               <h2 className="text-3xl font-black text-white mb-2">{result.product_name}</h2>
               <div className="flex gap-3 items-center">
                 <span className={`px-4 py-1.5 rounded-full font-bold text-white uppercase text-xs tracking-wider shadow-md ${result.plastic_level === 'high' ? 'bg-red-500' : result.plastic_level === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-500'}`}>
                   {result.plastic_level} PLASTIC
                 </span>
                 <span className="text-slate-400 font-medium tracking-wide">Verdict: {result.verdict}</span>
               </div>
             </div>
             <div className="text-right">
                <div className="text-5xl font-display font-bold text-white">{result.score}<span className="text-xl text-slate-500">/100</span></div>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">AI Suggested Alternatives</h3>
              <ul className="space-y-4">
                {result.alternatives.map((item: string, i:number) => (
                   <li key={i} className="flex gap-3 items-center text-slate-200 bg-teal-900/40 p-4 rounded-xl border border-teal-500/30 font-medium shadow-sm"><CheckCircle2 className="w-5 h-5 text-[#00ff9f]" /> {item}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center items-center p-6 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
              <Fingerprint className="w-10 h-10 text-teal-400 mb-4" />
              <p className="text-slate-200 font-bold text-lg leading-relaxed">{result.recommendation}</p>
              <button onClick={()=>setResult(null)} className="mt-8 px-8 py-3 rounded-xl bg-[#00ff9f]/20 text-[#00ff9f] border border-[#00ff9f]/50 font-bold hover:bg-[#00ff9f]/30 transition-colors shadow-[0_0_15px_rgba(0,255,159,0.1)]">Scan Another</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// 4. GAMIFICATION & EXPERIMENTAL
function Gamification() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/challenge/list`).then(r => r.json()).then(d => setChallenges(d.challenges || [{id: 1, title: "Zero Waste Week", difficulty: "Medium", impact: "High reduction", participants: 42}])).catch(()=>{});
    fetch(`${API_BASE}/challenge/leaderboard`).then(r => r.json()).then(setLeaderboard).catch(()=>{});
  }, []);

  const join = async (id: number) => {
    await fetch(`${API_BASE}/challenge/join`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ challenge_id: id, user_id: 'demo_user' })}).catch(()=>{});
    alert("Mission Accepted! Added to Active Quests.");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 relative z-10 pt-10 pb-20 px-6">
      <h1 className="text-4xl font-bold text-white font-display mb-8">Gamification System</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {challenges.map(c => (
          <div key={c.id} className={GLASS_PANEL + " flex flex-col group hover:border-[#00ff9f]/40 transition-colors shadow-lg"}>
            <h3 className="text-xl font-bold text-white mb-2">{c.title}</h3>
            <span className="text-xs px-3 py-1 bg-teal-900/40 text-teal-300 font-bold tracking-wider uppercase inline-block rounded-full self-start mb-4 border border-teal-500/20">{c.difficulty} Difficulty</span>
            <p className="text-slate-400 mb-6 flex-1 font-medium">{c.impact}</p>
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-700/50">
              <span className="text-slate-500 text-sm font-bold">👥 {c.participants} joined</span>
              <button onClick={() => join(c.id)} className="px-5 py-2 rounded-xl bg-[#00ff9f]/20 text-[#00ff9f] font-extrabold text-sm hover:bg-[#00ff9f]/40 transition-all group-hover:scale-105 active:scale-95 shadow-md">Join Quest</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className={GLASS_PANEL + " p-0 overflow-hidden shadow-2xl mt-12"}>
        <div className="p-6 border-b border-slate-700 bg-slate-800/20 backdrop-blur-md flex items-center gap-4">
           <Award className="w-8 h-8 text-yellow-500" />
           <h2 className="text-2xl font-bold text-white font-display">Global Leaderboard (Trending)</h2>
        </div>
        {leaderboard.length === 0 ? <p className="p-10 text-slate-500 text-center font-bold text-lg animate-pulse">Aggregating global telemetry...</p> : 
          <table className="w-full text-left">
            <thead className="bg-[#0f172a]/90 text-slate-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <tr>
                <th className="p-5 w-24">Rank</th>
                <th className="p-5">User</th>
                <th className="p-5 text-right w-48">Reduction Target</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u, i) => (
                <tr key={u.user} className="border-b border-slate-800 last:border-0 hover:bg-[#1e293b]/50 transition-colors">
                  <td className={`p-5 font-black text-lg ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-600'}`}>#{i + 1}</td>
                  <td className="p-5 text-slate-200 font-bold flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white">
                       {u.user.substring(0,2)}
                     </div>
                     {u.user}
                  </td>
                  <td className="p-5 text-right">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-bold border border-green-500/30">{u.reduction_percent}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  )
}

function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => { fetch(`${API_BASE}/user/settings`).then(r => r.json()).then(setSettings).catch(()=>{}); }, []);

  const save = async () => {
    setSaving(true);
    await fetch(`${API_BASE}/user/settings`, { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(settings) }).catch(()=>{});
    setSaving(false); setToast(true); setTimeout(() => setToast(false), 3000);
  };

  const update = (category: string, key: string, value: any) => {
    setSettings((s:any) => ({ ...s, [category]: { ...s[category], [key]: value } }));
    if (key === 'mode') {
      if (value === 'light') document.body.classList.add('theme-light');
      else document.body.classList.remove('theme-light');
    }
  };

  if (!settings) return <div className="p-20"><Zap className="animate-spin w-8 h-8 text-teal-400 mx-auto" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative z-10 pt-10 pb-20 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white font-display">System Preferences</h1>
        <button onClick={save} disabled={saving} className={BUTTON_PRIMARY}>
          {saving ? <Zap className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Save Preferences
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 z-50">
            <CheckCircle2 className="w-5 h-5" /> Settings Saved!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={GLASS_PANEL}>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Palette className="w-5 h-5 text-teal-400" /> Appearance</h2>
          <div className="flex items-center justify-between p-4 bg-[#1e293b]/50 rounded-xl border border-slate-700/50">
            <span className="text-slate-300 font-medium">Dark Mode Switch</span>
            <button onClick={() => update("theme", "mode", settings.theme?.mode === 'dark' ? 'light' : 'dark')}
              className={`w-14 h-7 rounded-full shadow-inner transition-colors relative ${settings.theme?.mode === 'dark' ? 'bg-[#00ff9f]' : 'bg-slate-600'}`}>
              <div className={`w-5 h-5 rounded-full bg-slate-900 absolute top-1 transition-transform ${settings.theme?.mode === 'dark' ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className={GLASS_PANEL}>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-teal-400" /> Ecosystem Defaults</h2>
          <select value={settings.eco_preferences?.goal} onChange={e=>update("eco_preferences", "goal", e.target.value)} className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-4 text-white font-medium outline-none focus:border-teal-500 shadow-inner">
             <option value="low">Casual Reducer</option>
             <option value="medium">Eco Warrior</option>
             <option value="high">Zero Trace Hardcore</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// 5. PLUGINS HUB
function PluginsHub() {
  const [activePlugin, setActivePlugin] = useState<string|null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);

  const plugins = [
    { id: 'amazon', name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.in' },
    { id: 'flipkart', name: 'Flipkart', logo: 'https://logo.clearbit.com/flipkart.com' },
    { id: 'swiggy', name: 'Swiggy', logo: 'https://logo.clearbit.com/swiggy.com' },
    { id: 'zomato', name: 'Zomato', logo: 'https://logo.clearbit.com/zomato.com' },
    { id: 'dunzo', name: 'Dunzo', logo: 'https://logo.clearbit.com/dunzo.com' },
    { id: 'bigbasket', name: 'BigBasket', logo: 'https://logo.clearbit.com/bigbasket.com' },
  ];

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/plugin/analyze`, { method: "POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ user_id: "demo_user", platform: activePlugin, content: input || "test", demo_mode: demoMode }) });
      setResult(await res.json());
    } catch {
      setResult({ impact_score: 50, packaging_level: "medium", recommendations: ["Try eco-friendly alternatives", "Ask for zero plastic checkout"], alternatives: ["Local eco stores"]});
    }
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 relative z-10 pt-10 pb-20 px-6">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-4xl font-bold text-white font-display">Plugins Hub</h1>
        <div className="flex items-center gap-3">
           <span className="text-sm font-bold text-slate-400">Demo Mode</span>
           <button onClick={()=>setDemoMode(!demoMode)} className={`w-12 h-6 rounded-full relative transition-colors ${demoMode ? 'bg-teal-500' : 'bg-slate-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${demoMode ? 'translate-x-7' : 'translate-x-1'}`} />
           </button>
        </div>
      </div>
      
      {!activePlugin ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {plugins.map(p => (
            <div key={p.id} className={`${GLASS_PANEL} flex flex-col items-center p-8 hover:border-[#00ff9f]/30 transition-all cursor-pointer group hover:scale-105`}>
               <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-4 transform group-hover:scale-110 transition-transform overflow-hidden p-2">
                 <img src={p.logo} alt={p.name} className="w-full h-full object-contain filter drop-shadow-sm" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=" + p.name + "&background=random"; }} />
               </div>
               <h3 className="text-white font-bold text-lg mb-1">{p.name}</h3>
               <p className="text-xs text-slate-500 mb-6 font-bold uppercase">Not Connected</p>
               <button onClick={()=>setActivePlugin(p.id)} className="px-6 py-2.5 rounded-xl bg-[#00ff9f]/10 text-[#00ff9f] hover:bg-[#00ff9f]/30 border border-[#00ff9f]/30 font-bold w-full uppercase text-sm active:scale-95 transition-colors">Connect</button>
            </div>
          ))}
        </div>
      ) : (
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className={GLASS_PANEL}>
           <button onClick={()=>{setActivePlugin(null); setResult(null); setInput("");}} className="text-slate-400 mb-6 hover:text-white font-bold text-sm flex items-center gap-1 active:scale-95">← Back to Directory</button>
           <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">Connect {activePlugin}</h2>
           <p className="text-slate-400 mb-8 font-medium">Paste your {activePlugin} cart link or order description to route through the AI Analyzer Engine.</p>
           
           {!result ? (
             <div className="space-y-4">
               <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={`Paste ${activePlugin} link or text here...`} className="w-full h-32 bg-[#1e293b] text-white rounded-xl px-5 py-4 outline-none border border-slate-700 focus:border-[#00ff9f]/50 transition-colors shadow-inner font-medium" />
               <button onClick={analyze} disabled={loading || (!input.trim() && !demoMode)} className={BUTTON_PRIMARY + " w-full justify-center py-4"}>
                 {loading ? <Zap className="animate-spin w-5 h-5" /> : "Intercept & Analyze Impact"}
               </button>
             </div>
           ) : (
             <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-[#1e293b]/50 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-800">
                    <motion.div initial={{width:0}} animate={{width: `${result.impact_score}%`}} transition={{duration: 1, ease: 'easeOut'}} className={`h-full ${result.impact_score > 70 ? 'bg-red-500' : result.impact_score > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}></motion.div>
                </div>
                <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-6 mt-4">
                   <div>
                     <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">AI Impact Analysis</h3>
                     <div className="flex gap-3">
                       <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase shadow-sm ${result.packaging_level==='high'?'bg-red-500 text-white':result.packaging_level==='medium'?'bg-yellow-500 text-black':'bg-green-500 text-white'}`}>{result.packaging_level} Packaging</span>
                     </div>
                   </div>
                   <div className="text-right">
                     <span className="text-5xl font-black text-white">{result.impact_score}</span><span className="text-slate-500 font-bold text-lg">/100</span>
                   </div>
                </div>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#00ff9f]" /> Eco Recommendations</h4>
                <ul className="space-y-3 mb-6">
                  {result.recommendations.map((r:string, i:number)=>(
                    <li key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-slate-200 font-medium tracking-wide">✓ {r}</li>
                  ))}
                </ul>
                {result.alternatives && result.alternatives.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h4 className="text-yellow-400 font-bold mb-3 uppercase tracking-widest text-xs">Better Alternatives</h4>
                    <div className="flex flex-wrap gap-2">
                       {result.alternatives.map((a:string, i:number)=>(
                          <span key={i} className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-full text-sm font-bold shadow-inner">{a}</span>
                       ))}
                    </div>
                  </div>
                )}
             </motion.div>
           )}
        </motion.div>
      )}
    </div>
  )
}

// ROUTER & SIDEBAR
function MainLayout({ session }: { session: any }) {
  const location = useLocation();
  useEffect(() => {
    fetch(`${API_BASE}/user/settings`).then(r => r.json()).then(data => {
      if(data?.theme?.mode === 'light') document.body.classList.add('theme-light');
    }).catch(()=>{});
  }, []);

  const tabs = [
    { id: '/', label: 'Overview', icon: LayoutDashboard },
    { id: '/scanner', label: 'Live Scanner', icon: Camera },
    { id: '/plugins', label: 'Plugins Hub', icon: Activity },
    { id: '/challenges', label: 'Gamification', icon: Target },
    { id: '/community', label: 'Social Hub', icon: Users },
    { id: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#07131f] text-slate-300 font-sans selection:bg-teal-500/30 overflow-hidden flex">
      <div className="fixed inset-0 pointer-events-none background-glow" />
      <div className="fixed inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
      
      <aside className="w-80 h-screen border-r border-slate-800/60 bg-[#07131f]/90 backdrop-blur-3xl flex flex-col relative z-20 flex-shrink-0 animate-fade-in shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-8 pb-4 flex flex-col items-start gap-4">
          <div className="w-24 h-24 mb-2 relative group overflow-hidden rounded-3xl cursor-pointer">
            <div className="absolute inset-0 bg-[#00ff9f] opacity-20 blur-xl group-hover:opacity-50 transition-opacity duration-300" />
            <img src="/logo.png" alt="ZeroTrace Logo" className="w-full h-full object-contain [filter:drop-shadow(0_0_20px_rgba(0,255,159,0.7))] transform group-hover:scale-110 transition-transform duration-500 relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display tracking-tight text-white drop-shadow-md">ZeroTrace</h1>
            <p className="text-[10px] text-[#00ff9f] uppercase tracking-widest font-black mt-1 bg-teal-900/30 inline-block px-2 py-0.5 rounded-full border border-teal-500/30">Enterprise v4.0</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto custom-scrollbar">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = location.pathname === t.id;
            return (
              <Link key={t.id} to={t.id} className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-[15px] ${active ? 'bg-gradient-to-r from-slate-800/90 to-slate-800/40 text-white shadow-lg border border-slate-700/50 translate-x-2' : 'text-slate-400 hover:text-white hover:bg-slate-800/40 hover:translate-x-1'}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-[#00ff9f] drop-shadow-[0_0_10px_rgba(0,255,159,0.8)]' : ''}`} />
                {t.label}
                {active && <motion.div layoutId="nav-pill" className="absolute left-0 w-1.5 h-8 bg-[#00ff9f] rounded-r-full shadow-[0_0_15px_#00ff9f]" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={async () => { try { await signOut(); } catch {} }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all border border-red-500/20 active:scale-95">
             Log Out
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative h-screen custom-scrollbar scroll-smooth">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<SmartScanner />} />
            <Route path="/plugins" element={<PluginsHub />} />
            <Route path="/challenges" element={<Gamification />} />
            <Route path="/community" element={<CommunityChat session={session} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('zt_theme') || 'dark');
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);
  const [session, setSession] = useState<any>(undefined); // undefined = loading

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('zt_theme', theme);
  }, [theme]);

  // Real Supabase session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Loading spinner while Supabase resolves session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#07131f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → show Login
  if (!session) return <Login />;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
        <MainLayout session={session} />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
