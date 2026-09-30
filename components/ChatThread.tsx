"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Role } from "@/lib/database.types";

const POLL_MS = 4000;

export default function ChatThread({
  alunoId,
  personalId,
  senderRole,
  compact,
}: {
  alunoId: string;
  personalId: string;
  senderRole: Role;
  compact?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("aluno_id", alunoId)
      .eq("personal_id", personalId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as ChatMessage[]);
  }

  useEffect(() => {
    // Intentional: polling data fetch on mount + interval, not a derived
    // state calculation — `load` sets state asynchronously (after its
    // `await`), so this is the standard "fetch on mount" effect pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoId, personalId]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.from("chat_messages").insert({
      aluno_id: alunoId,
      personal_id: personalId,
      sender_role: senderRole,
      text: trimmed,
    });
    setSending(false);
    if (!error) {
      setText("");
      load();
    }
  }

  return (
    <div>
      <div
        className="fx-chat-thread"
        ref={threadRef}
        style={compact ? { maxHeight: 180 } : undefined}
      >
        {messages.length === 0 && (
          <div className="fx-empty-state">Nenhuma mensagem ainda. Diga oi!</div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              "fx-chat-bubble " +
              (m.sender_role === senderRole ? "from-me" : "from-them")
            }
          >
            <div className="fx-chat-bubble-text">{m.text}</div>
            <div className="fx-chat-bubble-time">
              {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
      <form className="fx-chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva uma mensagem..."
        />
        <button className="btn" type="submit" disabled={sending}>
          Enviar
        </button>
      </form>
    </div>
  );
}
