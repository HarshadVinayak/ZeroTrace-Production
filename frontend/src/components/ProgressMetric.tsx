type Props = {
  label: string;
  value: string;
  progress: number;
  hint?: string;
};

export function ProgressMetric({ label, value, progress, hint }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <span className="text-2xl font-semibold text-white">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon via-emerald-400 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}
