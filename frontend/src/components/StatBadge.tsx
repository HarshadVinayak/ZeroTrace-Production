type Props = {
  label: string;
  value: string | number;
};

export function StatBadge({ label, value }: Props) {
  return (
    <div className="glass-panel rounded-2xl px-4 py-3">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
