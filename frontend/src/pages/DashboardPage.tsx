import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, Lightbulb, Sparkles } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ChatAssistant } from "../components/ChatAssistant";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassCard } from "../components/GlassCard";
import { ProgressMetric } from "../components/ProgressMetric";
import { StatBadge } from "../components/StatBadge";
import { api } from "../lib/api";
import type { DashboardResponse } from "../types";

export function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.dashboard();
        setData(response);
      } catch {
        setError("AI is currently unavailable, showing smart fallback");
      }
    };
    void load();
  }, []);

  const score = data?.score ?? data?.profile?.plastic_score ?? 50;
  const reduction = data?.weekly_report?.reduction_percent ?? 12;
  const insights = data?.weekly_report?.suggestions ?? [
    "Based on your habits, reducing takeaway packaging will have highest impact.",
    "Switching to reusable bottles can reduce 30% waste."
  ];

  return (
    <AppShell
      title="A real AI SaaS dashboard for plastic reduction"
      subtitle="ZeroTrace turns personal behavior, AI reasoning, and community signals into a startup-grade dashboard with resilient fallback behavior."
      badge="Dashboard · decision intelligence"
    >
      <ErrorBanner message={error} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <GlassCard className="animated-gradient xl:col-span-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-neon/80">Plastic Score</p>
              <div className="mt-4 flex items-end gap-4">
                <h3 className="text-6xl font-semibold tracking-tight text-white">{score}</h3>
                <div className="pb-2 text-slate-200">
                  <p className="text-lg font-medium">{data?.profile?.risk_level ?? "Medium Risk"}</p>
                  <p className="text-sm text-slate-300">Lower is better</p>
                </div>
              </div>
              <div className="mt-6">
                <ProgressMetric
                  label="Weekly Reduction"
                  value={`${reduction}%`}
                  progress={reduction}
                  hint="AI-estimated reduction opportunity"
                />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <StatBadge label="Streak" value={`${data?.streak ?? 4} days`} />
                <StatBadge label="Chats" value={data?.stats?.chat_count ?? 0} />
                <StatBadge label="Analyses" value={data?.stats?.product_analyses ?? 0} />
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5">
              <div className="mb-4 inline-flex rounded-full bg-neon/10 p-3 text-neon">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-xl font-semibold text-white">{data?.profile?.ai_twin?.title ?? "Eco Twin"}</h4>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {data?.profile?.habit_summary ??
                  "Your digital eco identity updates after every chat, analysis, and community action."}
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">AI insight</p>
                <p className="mt-2 text-sm text-slate-200">{data?.weekly_report?.summary ?? insights[0]}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard
          title="AI Insights"
          subtitle="Live suggestions from the ZeroTrace loop engine."
          className="xl:col-span-4"
        >
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 inline-flex rounded-full bg-neon/10 p-2 text-neon">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-slate-200">{insight}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="xl:col-span-7">
          <ChatAssistant />
        </div>

        <GlassCard title="Weekly Focus" subtitle="High-signal next moves the team can demo." className="xl:col-span-5">
          <div className="space-y-4">
            {(data?.recommended_challenges ?? []).slice(0, 3).map((challenge) => (
              <div key={challenge.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-white">{challenge.title}</h4>
                    <p className="mt-1 text-sm text-slate-300">{challenge.description}</p>
                  </div>
                  <span className="rounded-full bg-neon/10 px-3 py-1 text-xs text-neon">{challenge.participants ?? 0} joined</span>
                </div>
              </div>
            ))}
            {!data?.recommended_challenges?.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                ZeroTrace will recommend a challenge after the first interaction.
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard title="Product Stats" subtitle="Fast top-level demo metrics." className="xl:col-span-12">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Activity className="h-5 w-5 text-neon" />
              <p className="mt-4 text-3xl font-semibold text-white">{score}</p>
              <p className="mt-1 text-sm text-slate-400">Plastic score</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <ArrowUpRight className="h-5 w-5 text-neon" />
              <p className="mt-4 text-3xl font-semibold text-white">{reduction}%</p>
              <p className="mt-1 text-sm text-slate-400">Weekly reduction</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Sparkles className="h-5 w-5 text-neon" />
              <p className="mt-4 text-3xl font-semibold text-white">{data?.stats?.community_posts ?? 0}</p>
              <p className="mt-1 text-sm text-slate-400">Community posts</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Lightbulb className="h-5 w-5 text-neon" />
              <p className="mt-4 text-3xl font-semibold text-white">{data?.challenge_board?.length ?? 0}</p>
              <p className="mt-1 text-sm text-slate-400">Active challenges</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
