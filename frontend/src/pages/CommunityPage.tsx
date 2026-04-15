import { Heart, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { ErrorBanner } from "../components/ErrorBanner";
import { GlassCard } from "../components/GlassCard";
import { api } from "../lib/api";
import type { CommunityPost } from "../types";

export function CommunityPage() {
  const [feed, setFeed] = useState<CommunityPost[]>([]);
  const [name, setName] = useState("IIT Demo");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await api.communityFeed();
      setFeed(response.feed);
    } catch {
      setError("AI is currently unavailable, showing smart fallback");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await api.postCommunity(name || "IIT Demo", message);
      setMessage("");
      await load();
    } catch {
      setError("AI is currently unavailable, showing smart fallback");
    } finally {
      setLoading(false);
    }
  };

  const like = async (postId: number) => {
    try {
      await api.likePost(postId);
      await load();
    } catch {
      setError("AI is currently unavailable, showing smart fallback");
    }
  };

  return (
    <AppShell
      title="Community feed with a Discord-style demo flow"
      subtitle="Users can post eco ideas, like posts, and see social proof around behavior change with no auth required."
      badge="Community"
    >
      <ErrorBanner message={error} />
      <div className="grid gap-5 xl:grid-cols-12">
        <GlassCard title="Share a tip" className="xl:col-span-4">
          <div className="space-y-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm outline-none focus:border-neon/40"
              placeholder="Name"
            />
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-40 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm outline-none focus:border-neon/40"
              placeholder="Share what helped you reduce plastic today..."
            />
            <button
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-2xl bg-neon px-5 py-3 font-medium text-slate-950"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Community feed" className="xl:col-span-8">
          <div className="space-y-4">
            {feed.map((post) => (
              <div key={post.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{post.user}</p>
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                      {new Date(post.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => void like(post.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-neon/40 hover:bg-neon/10"
                  >
                    <Heart className="h-4 w-4" />
                    {post.reactions["♻️"] ?? 0}
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-200">{post.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-neon/10 px-3 py-1 text-xs text-neon">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
