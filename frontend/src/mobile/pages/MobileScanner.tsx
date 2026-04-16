import { motion } from 'framer-motion';
import { Camera, X, ScanLine, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export default function MobileScanner() {
  const navigate = useNavigate();
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
    <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-afe left-4 top-8 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        
        {!result && (
          <div className="relative z-10 w-64 h-64 border-2 border-theme-accent/50 rounded-3xl overflow-hidden before:absolute before:inset-0 before:bg-theme-accent/10 pointer-events-none absolute">
             {loading && (
               <div className="absolute inset-0 bg-slate-900/80 backdrop-blur flex flex-col items-center justify-center">
                  <Zap className="w-8 h-8 text-theme-accent animate-spin mb-2" />
                  <span className="text-white font-bold tracking-widest text-sm">ANALYZING</span>
               </div>
             )}
             {!loading && (
               <>
                 <motion.div 
                   animate={{ top: ['0%', '100%', '0%'] }} 
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute left-0 right-0 h-1 bg-theme-accent shadow-[0_0_15px_var(--accent-glow)]"
                 />
                 <ScanLine className="w-12 h-12 text-theme-accent/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               </>
             )}
          </div>
        )}

        {result && (
          <div className="absolute bottom-6 left-4 right-4 bg-theme-card border border-color p-5 rounded-3xl z-20 shadow-2xl">
            <h3 className="font-bold text-xl mb-1 text-theme-primary">{result.product_name}</h3>
            <p className="text-sm font-medium text-theme-secondary mb-3">{result.recommendation}</p>
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.plastic_level==='high'?'bg-red-500/20 text-red-500':result.plastic_level==='medium'?'bg-yellow-500/20 text-yellow-500':'bg-green-500/20 text-green-500'}`}>
                {result.plastic_level.toUpperCase()} PLASTIC
              </span>
              <span className="text-2xl font-black">{result.score}/100</span>
            </div>
            <button onClick={() => setResult(null)} className="mt-4 w-full bg-theme-accent text-white py-3 rounded-xl font-bold">Scan Again</button>
          </div>
        )}
      </div>

      <div className="h-40 bg-black pt-8 flex items-start justify-center pb-safe">
        <button onClick={capture} disabled={loading || !!result} className="w-20 h-20 rounded-full border-4 border-theme-accent flex items-center justify-center active:scale-90 transition-transform touch-manipulation">
          <div className="w-16 h-16 bg-theme-accent rounded-full"></div>
        </button>
      </div>
    </motion.div>
  );
}
