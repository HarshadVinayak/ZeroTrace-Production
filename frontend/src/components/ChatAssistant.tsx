import { Bot, Loader2, SendHorizonal, User2 } from "lucide-react";
import { useState } from "react";
import { api, FALLBACK_AI_MESSAGE } from "../lib/api";
import type { ChatResponse } from "../types";
import { ErrorBanner } from "./ErrorBanner";
import { GlassCard } from "./GlassCard";

type Message = {
  role: "user" | "assistant";
  content: string;
  provider?: string;
};

const starterPrompts = [
  "I want to order food tonight",
  "How do I reduce bottled water waste?",
  "What should I change in my weekly shopping habit?"
];

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "ZeroTrace is ready. Ask about a habit, buying decision, or product and I’ll return a safe action plan even if AI providers fail."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content) return;
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");

    try {
      const response: ChatResponse = await api.chat(content);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.response ?? response.reply ?? FALLBACK_AI_MESSAGE,
          provider: response.provider
        }
      ]);
    } catch {
      setError("AI is currently unavailable, showing smart fallback");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: FALLBACK_AI_MESSAGE,
          provider: "Fallback"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard
      title="AI Chat Assistant"
      subtitle="ChatGPT-style decision support backed by FastAPI and safe fallback logic."
      className="flex h-full flex-col"
    >
      <ErrorBanner message={error} />
      <div className="mb-4 flex flex-wrap gap-2">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => void send(prompt)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-neon/40 hover:bg-neon/10"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mb-4 flex max-h-[24rem] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" ? (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neon/15 text-neon">
                <Bot className="h-4 w-4" />
              </div>
            ) : null}
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 ${
                message.role === "assistant"
                  ? "bg-white/6 text-slate-100"
                  : "bg-neon/15 text-neon"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.provider ? <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-400">{message.provider}</p> : null}
            </div>
            {message.role === "user" ? (
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                <User2 className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-auto flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder="Ask ZeroTrace what to do next..."
          className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm outline-none transition focus:border-neon/40"
        />
        <button
          onClick={() => void send()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-neon px-4 py-3 font-medium text-slate-950 transition hover:scale-[1.02] disabled:cursor-progress disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
          Send
        </button>
      </div>
    </GlassCard>
  );
}
