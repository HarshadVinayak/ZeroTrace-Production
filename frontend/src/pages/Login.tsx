import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Phone, Mail, ArrowRight, CheckCircle2, AlertTriangle, Leaf } from 'lucide-react';
import { signInWithGoogle, sendOTP, verifyOTP } from '../lib/supabase';

type Step = 'method' | 'phone' | 'otp';
type Method = 'google' | 'phone';

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
    try {
      await signInWithGoogle();
      // Redirect handled by Supabase OAuth — page navigates away
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed. Check Supabase config.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phone.trim()) { setError('Please enter a phone number.'); return; }
    clearMessages();
    setLoading(true);
    try {
      await sendOTP(phone);
      setSuccess('OTP sent! Check your messages.');
      setStep('otp');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP. Ensure phone auth is enabled in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) { setError('Please enter the OTP.'); return; }
    clearMessages();
    setLoading(true);
    try {
      await verifyOTP(phone, otp);
      // onAuthStateChange in App.tsx will handle state update
      setSuccess('Verified! Signing you in…');
    } catch (e: any) {
      setError(e.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07131f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Card */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

          {/* Logo + Branding */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <Leaf className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">ZeroTrace</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Intelligence for Sustainability</p>
          </div>

          {/* Method Tabs */}
          {step !== 'otp' && (
            <div className="flex gap-2 mb-6 bg-black/30 p-1 rounded-xl border border-white/10">
              {(['google', 'phone'] as Method[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setStep('method'); clearMessages(); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    method === m
                      ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m === 'google' ? '🌐 Google' : '📱 Phone OTP'}
                </button>
              ))}
            </div>
          )}

          {/* Feedback messages */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl mb-4 ${
                  error
                    ? 'bg-red-500/15 border border-red-500/30 text-red-400'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                }`}
              >
                {error
                  ? <AlertTriangle className="w-4 h-4 shrink-0" />
                  : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {error || success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Login */}
          <AnimatePresence mode="wait">
            {method === 'google' && step !== 'otp' && (
              <motion.div key="google" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-60 text-slate-900 py-3.5 rounded-xl font-extrabold transition-all shadow-lg active:scale-95"
                >
                  {loading ? (
                    <Zap className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>
              </motion.div>
            )}

            {/* Phone OTP — Step 1: Enter phone */}
            {method === 'phone' && step !== 'otp' && (
              <motion.div key="phone" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/30 text-white rounded-xl pl-11 pr-4 py-3.5 outline-none border border-white/10 focus:border-emerald-500/50 transition-colors font-medium placeholder:text-slate-600"
                  />
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 py-3.5 rounded-xl font-extrabold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
                >
                  {loading ? <Zap className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Send OTP</>}
                </button>
              </motion.div>
            )}

            {/* OTP verification — Step 2 */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <p className="text-slate-400 text-sm text-center">
                  OTP sent to <span className="text-white font-bold">{phone}</span>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-black/30 text-white rounded-xl px-5 py-3.5 outline-none border border-white/10 focus:border-emerald-500/50 transition-colors font-mono text-center text-lg tracking-[0.3em] placeholder:text-slate-600 placeholder:tracking-normal"
                />
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 4}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 py-3.5 rounded-xl font-extrabold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
                >
                  {loading ? <Zap className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Verify & Sign In</>}
                </button>
                <button
                  onClick={() => { setStep('method'); setOtp(''); clearMessages(); }}
                  className="w-full text-slate-500 hover:text-slate-300 text-sm font-medium py-2 transition-colors"
                >
                  ← Change number
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-slate-600 text-xs mt-6">
            Secured by <span className="text-emerald-600 font-semibold">Supabase Auth</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
