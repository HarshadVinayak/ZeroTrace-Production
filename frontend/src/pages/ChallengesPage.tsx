import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassCard } from "../components/GlassCard";
import { api } from "../lib/api";
import type { Challenge, LeaderboardEntry } from "../types";

export function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await api.challenges();
      setChallenges(response.challenges);
      setLeaderboard(response.leaderboard);
    } catch {
      setError("AI is currently unavailable, showing smart fallback");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const join = async (id: number) => {
    try {
      const response = await api.joinChallenge(id);
      setChallenges(response.challenges);
      setLeaderboard(response.leaderboard);
    } catch {
      setError("AI is currently unavailable, showing smart fallback");
    }
  };

  return (
    <AppShell
      title="Challenges with join flow and leaderboard"
      subtitle="A lightweight challenge system that turns the app into a retention loop and gives demos a visible engagement engine."
      badge="Challenges"
    >
      <ErrorBanner message={error} />
      <div className="grid gap-5 xl:grid-cols-12">
        <GlassCard title="Active Challenges" className="xl:col-span-8">
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{challenge.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-neon/10 px-3 py-1 text-xs text-neon">{challenge.difficulty ?? "Weekly"}</span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{challenge.metric ?? challenge.goal}</span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {challenge.participants ?? 0} participants
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => void join(challenge.id)}
                    className="rounded-2xl bg-neon px-5 py-3 font-medium text-slate-950 transition hover:scale-[1.02]"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Leaderboard" className="xl:col-span-4">
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div key={entry.challenge_id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neon/10 text-neon">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">#{entry.rank} {entry.title}</p>
                    <p className="text-xs text-slate-500">{entry.participants} joined</p>
                  </div>
                </div>
                <span className="text-sm text-slate-300">{entry.participants}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
