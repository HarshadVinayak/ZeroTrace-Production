import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "../components/AppShell";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassCard } from "../components/GlassCard";
import { api } from "../lib/api";
import type { WeeklyReport } from "../types";

export function WeeklyReportPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.weeklyReport();
        setReport(response);
      } catch {
        setError("AI is currently unavailable, showing smart fallback");
        setReport({
          reduction_percent: 18,
          top_issue: "takeaway packaging",
          suggestions: [
            "Turn off auto-cutlery for every order",
            "Carry a reusable bottle daily",
            "Use bulk snacks instead of wrappers"
          ]
        });
      }
    };
    void load();
  }, []);

  const chartData = useMemo(
    () => [
      { name: "Mon", reduction: Math.max(3, (report?.reduction_percent ?? 12) - 8) },
      { name: "Tue", reduction: Math.max(5, (report?.reduction_percent ?? 12) - 6) },
      { name: "Wed", reduction: Math.max(7, (report?.reduction_percent ?? 12) - 4) },
      { name: "Thu", reduction: Math.max(9, (report?.reduction_percent ?? 12) - 2) },
      { name: "Fri", reduction: report?.reduction_percent ?? 12 },
      { name: "Sat", reduction: (report?.reduction_percent ?? 12) + 3 },
      { name: "Sun", reduction: (report?.reduction_percent ?? 12) + 5 }
    ],
    [report]
  );

  return (
    <AppShell
      title="Weekly report built like a real SaaS analytics surface"
      subtitle="Track reduction percentage, top packaging issue, and actionable suggestions with chart-driven storytelling for demos."
      badge="Weekly report"
    >
      <ErrorBanner message={error} />
      <div className="grid gap-5 xl:grid-cols-12">
        <GlassCard title="Reduction Snapshot" className="xl:col-span-4">
          <p className="text-6xl font-semibold text-white">{report?.reduction_percent ?? 0}%</p>
          <p className="mt-3 text-sm text-slate-300">Estimated weekly reduction opportunity</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Top issue</p>
            <p className="mt-2 text-lg font-medium text-white">{report?.top_issue ?? "waiting"}</p>
          </div>
        </GlassCard>

        <GlassCard title="Weekly Trend" subtitle="Recharts-powered visualization for demos." className="xl:col-span-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px"
                  }}
                />
                <Bar dataKey="reduction" radius={[12, 12, 0, 0]} fill="#00ff9f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Suggestions" className="xl:col-span-12">
          <div className="grid gap-4 md:grid-cols-3">
            {(report?.suggestions ?? []).map((suggestion) => (
              <div key={suggestion} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
                {suggestion}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
