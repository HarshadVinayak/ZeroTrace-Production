import { AppShell } from "../components/AppShell";
import { ChatAssistant } from "../components/ChatAssistant";

export function ChatPage() {
  return (
    <AppShell
      title="AI chat like a real product console"
      subtitle="A focused chat workspace for coach-style sustainability advice, provider fallback handling, and real-time plastic reduction guidance."
      badge="AI chat assistant"
    >
      <div className="mx-auto max-w-5xl">
        <ChatAssistant />
      </div>
    </AppShell>
  );
}
