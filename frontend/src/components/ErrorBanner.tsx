type Props = {
  message?: string | null;
};

export function ErrorBanner({ message }: Props) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      {message}
    </div>
  );
}
