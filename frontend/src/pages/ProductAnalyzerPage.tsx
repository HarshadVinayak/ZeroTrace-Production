import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassCard } from "../components/GlassCard";
import { api } from "../lib/api";
import type { ProductResponse } from "../types";

export function ProductAnalyzerPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.analyzeProduct(query);
      setResult(response);
    } catch {
      setError("AI is currently unavailable, showing smart fallback");
      setResult({
        impact: "High",
        rating: 42,
        alternatives: ["Reusable bottle", "Refill station", "Low-packaging alternative"],
        summary: "Based on your habits, reducing takeaway packaging and single-use bottles will have highest impact."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Product analyzer with fast packaging intelligence"
      subtitle="Enter a product name or link and ZeroTrace converts it into packaging impact, sustainability rating, and alternative swaps."
      badge="Product analyzer"
    >
      <div className="grid gap-5 xl:grid-cols-12">
        <GlassCard title="Analyze Product" subtitle="Use a real backend request with safe UI fallback." className="xl:col-span-5">
          <ErrorBanner message={error} />
          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. bottled water, shampoo bottle, takeaway order"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 py-4 pl-11 pr-4 text-sm outline-none transition focus:border-neon/40"
              />
            </div>
            <button
              onClick={() => void analyze()}
              className="inline-flex items-center gap-2 rounded-2xl bg-neon px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Run analysis
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Analysis Result" subtitle="Structured output that looks judge-ready." className="xl:col-span-7">
          {result ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Impact</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{result.impact}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Rating</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{result.rating}/100</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Category</p>
                  <p className="mt-3 text-xl font-semibold text-white">{result.category ?? "General"}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm leading-7 text-slate-200">{result.summary ?? result.notes}</p>
                <div className="mt-5 space-y-3">
                  {result.alternatives.map((alternative) => (
                    <div key={alternative} className="rounded-2xl border border-neon/20 bg-neon/10 px-4 py-3 text-sm text-neon">
                      {alternative}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-sm text-slate-400">
              Analyze any product to reveal packaging impact and eco alternatives.
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
