import { BarChart3, Bot, ChartArea, FlaskConical, Leaf, MessageSquare, ShoppingBag, Trophy } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/chat", label: "AI Chat", icon: Bot },
  { to: "/analyzer", label: "Analyzer", icon: ShoppingBag },
  { to: "/weekly-report", label: "Weekly Report", icon: FlaskConical },
  { to: "/community", label: "Community", icon: MessageSquare },
  { to: "/challenges", label: "Challenges", icon: Trophy },
  { to: "/impact", label: "Impact", icon: ChartArea }
];

type Props = {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, badge = "AI behavioral ecosystem", children }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neon/20 text-neon">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">ZeroTrace</h1>
            <p className="text-xs text-slate-400">AI-powered plastic reduction</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full border px-3 py-2 text-xs transition ${
                  isActive
                    ? "border-neon/40 bg-neon/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-300"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-slate-950/70 p-6 backdrop-blur-2xl lg:block">
          <div className="glass-card animated-gradient neon-ring mb-6 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/20 text-neon">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">ZeroTrace</h1>
                <p className="text-sm text-slate-300">AI-powered plastic reduction</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-200/80">
              A funded-startup-style product layer built for demo reliability, decision intelligence, and habit change.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                    isActive
                      ? "border-neon/40 bg-neon/10 text-white shadow-[0_0_24px_rgba(0,255,159,0.12)]"
                      : "border-white/5 bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="glass-card mt-6 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-neon/80">Demo Mode Safety</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              If AI providers fail, ZeroTrace falls back to intelligent recommendations so the UI never crashes during demos.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <div className="glass-card mb-6 overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 text-xs uppercase tracking-[0.4em] text-neon/80">{badge}</p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
              </div>
              <div className="glass-panel inline-flex items-center gap-3 rounded-full px-4 py-3 text-sm text-slate-200">
                <span className="h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_16px_rgba(0,255,159,0.9)]" />
                Live SaaS-style demo UI
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
