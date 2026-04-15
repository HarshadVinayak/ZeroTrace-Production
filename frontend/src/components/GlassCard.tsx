import type { ReactNode } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
};

export function GlassCard({ title, subtitle, className = "", children }: Props) {
  return (
    <section className={`glass-card p-5 sm:p-6 ${className}`}>
      {(title || subtitle) && (
        <header className="mb-5">
          {title ? <h3 className="text-lg font-semibold tracking-tight">{title}</h3> : null}
          {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}
