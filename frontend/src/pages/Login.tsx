import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Phone, ArrowRight, CheckCircle2, AlertTriangle, Leaf, Sparkles, Globe } from 'lucide-react';

type Step = 'method' | 'phone' | 'otp';
type Method = 'google' | 'phone';

const STAGGER_CHILDREN = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 }
};

export default function Login() {
  const [method, setMethod] = useState<Method>('google');
  const [step, setStep] = useState<Step>('method');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => { setError(null); setSuccess(null); };

  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);
    // Fake Google Login
    setTimeout(() => {
      setSuccess('Logged in securely!');
      setLoading(false);
      window.location.reload();
    }, 1500);
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) { setError('Please enter a phone number.'); return; }
    clearMessages();
    setLoading(true);
    setTimeout(() => {
      setSuccess('OTP sent! Check your messages.');
      setStep('otp');
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) { setError('Please enter the OTP.'); return; }
    clearMessages();
    setLoading(true);
    setTimeout(() => {
      setSuccess('Verified! Signing you in...');
      setLoading(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#07131f] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full background-glow opacity-30" />
      </div>

      <motion.div
        variants={STAGGER_CHILDREN}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md"
      >
        {/* Floating Decoration Icons */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 -left-8 text-emerald-500/20"
        >
          <Leaf className="w-16 h-16" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-12 -right-8 text-blue-500/20"
        >
          <Globe className="w-16 h-16" />
        </motion.div>

        {/* Main Glass Card */}
        <motion.div
          variants={FADE_UP}
          className="backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.7)] group glass-shine"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]"
            >
              <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400/10" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-display uppercase italic">ZeroTrace</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-emerald-500/30" />
              <p className="text-emerald-400/60 text-[10px] font-black uppercase tracking-[0.3em]">AI Sustainability</p>
              <span className="w-8 h-px bg-emerald-500/30" />
            </div>
          </div>

          {/* Tab Switcher */}
          {step !== 'otp' && (
            <motion.div variants={FADE_UP} className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {(['google', 'phone'] as Method[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setStep('method'); clearMessages(); }}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                    method === m
                      ? 'bg-emerald-500 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m === 'google' ? '🌐 Google' : '📱 Phone'}
                </button>
              ))}
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`overflow-hidden mb-6`}
              >
                <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold border ${
                  error ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
                  {error || success}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Area */}
          <div className="min-h-[140px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {method === 'google' && step !== 'otp' && (
                <motion.div key="google" variants={FADE_UP} initial="initial" animate="animate" exit="exit">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-14 flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 rounded-2xl font-black text-sm transition-all duration-300 shadow-xl active:scale-95"
                  >
                    {loading ? (
                      <Zap className="w-5 h-5 animate-spin" />
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Sign in with Google
                  </button>
                  <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-6">Secure One-Click Authentication</p>
                </motion.div>
              )}

              {method === 'phone' && step !== 'otp' && (
                <motion.div key="phone" variants={FADE_UP} initial="initial" animate="animate" exit="exit" className="space-y-4">
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                      placeholder="+91 98765 43210"
                      className="w-full h-14 bg-black/40 text-white rounded-2xl pl-12 pr-5 outline-none border border-white/10 focus:border-emerald-500/50 transition-all font-bold placeholder:text-slate-700"
                    />
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !phone}
                    className="w-full h-14 flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-900 rounded-2xl font-black text-sm transition-all duration-300 shadow-[0_15px_30px_rgba(16,185,129,0.3)] active:scale-95"
                  >
                    {loading ? <Zap className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Send Access Code</>}
                  </button>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div key="otp" variants={FADE_UP} initial="initial" animate="animate" exit="exit" className="space-y-5">
                  <div className="text-center space-y-1">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Verify Identity</p>
                    <p className="text-white font-black">{phone}</p>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                    placeholder="••••••"
                    className="w-full h-16 bg-black/40 text-[#00ff9f] rounded-2xl px-5 outline-none border border-white/10 focus:border-emerald-500/50 transition-all font-mono text-center text-3xl tracking-[0.5em] placeholder:text-slate-800 placeholder:tracking-normal"
                  />
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length < 4}
                    className="w-full h-14 flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-900 rounded-2xl font-black text-sm transition-all shadow-[0_15px_30px_rgba(16,185,129,0.3)] active:scale-95"
                  >
                    {loading ? <Zap className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm & Enter</>}
                  </button>
                  <button
                    onClick={() => { setStep('method'); setOtp(''); clearMessages(); }}
                    className="w-full text-slate-600 hover:text-emerald-400 text-xs font-black uppercase tracking-widest py-2 transition-colors"
                  >
                    ← Wrong Number?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          variants={FADE_UP}
          className="mt-10 text-center space-y-4"
        >
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            <span className="w-6 h-px bg-slate-800" />
            Protected by Supabase
            <span className="w-6 h-px bg-slate-800" />
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
