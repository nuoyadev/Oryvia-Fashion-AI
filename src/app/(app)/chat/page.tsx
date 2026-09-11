"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/client/lib/api";
import { useApp } from "@/client/state";
import { Button, Card, SectionTitle, Spinner, cx } from "@/components/ui";
import { SendIcon, TrashIcon, WeatherIcon } from "@/components/icons";
import { OutfitCard } from "@/components/outfit";
import { ShoppingListView } from "@/components/shopping";
import type { ChatMessage, ChatReply, Outfit } from "@/client/types";

const SUGGESTIONS = [
  "Une tenue pour un mariage",
  "Un look business casual",
  "Je vais à un rendez-vous",
  "Améliore mon style avec 300 €",
  "Analyse mes inspirations",
  "Quelles couleurs me vont ?",
];

export default function ChatPage() {
  const { user, toast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<ChatMessage[]>("/api/chat").then(setMessages).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setMessages((m) => [...m, { id: `u-${Date.now()}`, userId: "", role: "user", content: trimmed, createdAt: Date.now() }]);
    setBusy(true);
    try {
      const reply = await api<ChatReply>("/api/chat", { method: "POST", body: JSON.stringify({ text: trimmed }) });
      setMessages((m) => [...m, { id: `a-${Date.now()}`, userId: "", role: "assistant", content: reply, createdAt: Date.now() }]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erreur", "error");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    await api("/api/chat/clear", { method: "POST" });
    setMessages([]);
    toast("Conversation effacée.");
  }

  return (
    <div className="animate-fade-up flex h-[calc(100vh-9rem)] flex-col lg:h-[calc(100vh-6rem)]">
      <SectionTitle
        kicker="AI Stylist"
        title={`Parle à Oryvia${user?.name ? `, ${user.name}` : ""}`}
        action={
          messages.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clear}>
              <TrashIcon className="h-4 w-4" /> Effacer
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4">
        {messages.length === 0 && !busy && (
          <Card className="mx-auto max-w-md text-center">
            <p className="text-3xl">👋</p>
            <p className="mt-2 font-display text-lg text-cream">Comment puis-je t'aider aujourd'hui ?</p>
            <p className="mt-1 text-sm text-muted">Une occasion, un budget, une envie de style…</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-rose/50 hover:text-cream"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {busy && (
          <div className="flex items-center gap-3">
            <Avatar />
            <div className="flex gap-1.5 rounded-2xl rounded-tl-sm bg-card px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-card p-1.5 pl-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="« Une tenue pour un date à Lyon »"
          className="flex-1 bg-transparent text-sm text-cream outline-none placeholder:text-muted/60"
        />
        <Button type="submit" size="sm" disabled={!input.trim() || busy} className="h-10 w-10 rounded-full p-0">
          <SendIcon className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

function Avatar() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm">
      ✦
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const [feedback, setFeedback] = useState<Outfit["feedback"]>(null);
  const content =
    typeof message.content === "string"
      ? ({ text: message.content, kind: "chat" } as ChatReply)
      : (message.content as ChatReply);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-gradient px-4 py-3 text-sm text-white">
          {String(typeof message.content === "string" ? message.content : content.text)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="max-w-[88%] space-y-3">
        <div className="rounded-2xl rounded-tl-sm border border-white/[0.06] bg-card px-4 py-3 text-sm leading-relaxed text-cream">
          {content.text}
        </div>

        {content.weather && (
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] px-4 py-2.5 text-sm text-muted">
            <WeatherIcon className="h-4 w-4 text-coral" />
            {content.weather.icon} {content.weather.description}, {content.weather.tempC}°C à {content.weather.city}
          </div>
        )}

        {content.kind === "outfit" && content.outfit && (
          <OutfitCard
            look={content.outfit.look}
            compact
            outfitId={content.outfit.outfitId}
            feedback={feedback}
            onFeedback={setFeedback}
          />
        )}

        {content.kind === "shopping" && content.shopping && (
          <div className="rounded-3xl border border-white/[0.06] bg-card p-4">
            <ShoppingListView
              budget={content.shopping.budget}
              items={content.shopping.items}
              total={content.shopping.total}
            />
          </div>
        )}
      </div>
    </div>
  );
}
