"use client";

import { useState, useEffect, useRef } from "react";
import { Send, RefreshCw, Bot, X as CloseIcon } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  loading?: boolean;
}

export function KwuChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo! Selamat datang di KWU. Saya Asisten KWU. Saya bisa membantu kamu menemukan produk, memahami cara pemesanan, atau mengajukan penawaran bisnis.",
      createdAt: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickReplies = [
    "Cari produk",
    "Cara memesan",
    "Lacak pesanan",
    "Layanan B2B",
    "Hubungi admin",
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const loadingMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      loading: true,
    };
    setMessages((prev) => [...prev, loadingMsg]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("Gagal mendapatkan balasan");

      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content: data.reply ?? "Maaf, saya belum bisa menjawab saat ini.",
                loading: false,
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                content:
                  "Maaf, asisten tidak tersedia saat ini. Silakan coba lagi nanti atau hubungi admin.",
                loading: false,
              }
            : m
        )
      );
      setConnected(false);
    } finally {
      setSending(false);
    }
  };

  const addQuickReply = (text: string) => {
    setInput(text);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {/* Tombol chat floating */}
      <button
        onClick={() => setOpen(true)}
        className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-orange-500/40 hover:bg-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Buka Asisten KWU"
      >
        <Bot className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Buka Asisten KWU</span>
      </button>

      {/* Panel chat */}
      {open && (
        <div className="fixed inset-0 z-[101] flex flex-col" role="dialog" aria-modal="true" aria-label="Asisten KWU">
          {/* Overlay */}
          <button
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30 lg:hidden"
            aria-label="Tutup chat"
          />

          {/* Panel */}
          <div className="flex flex-col h-full w-full lg:w-[430px] lg:h-[600px] lg:absolute lg:bottom-4 lg:right-4 lg:rounded-2xl lg:shadow-2xl bg-surface border border-border">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-white rounded-t-2xl lg:rounded-t-none lg:rounded-r-2xl">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" aria-hidden="true" />
                <span className="font-semibold">Asisten KWU</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-amber-500"}`}
                  aria-hidden="true"
                />
                <span>{connected ? "Terhubung" : "Terputus"}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-md"
                aria-label="Tutup chat"
              >
                <CloseIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg rounded-tr-none ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tl-none"
                        : "bg-neutral-100 text-foreground rounded-br-none"
                    }`}
                  >
                    {msg.content}
                    {msg.loading && (
                      <span className="ml-2 h-3 w-3 rounded-full bg-current animate-pulse" aria-hidden="true" />
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="border-t border-border p-3 bg-surface">
              {/* Quick replies */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {quickReplies.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => addQuickReply(qr)}
                    className="px-3 py-1.5 rounded-full border border-neutral-200 text-sm text-neutral-600 bg-white hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  disabled={sending}
                  className="flex-1 pl-4 pr-10 py-2.5 border border-border rounded-full text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  aria-label="Input pesan chatbot"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="p-2.5 rounded-full bg-primary text-white hover:bg-orange-500 disabled:opacity-60 transition-colors"
                  aria-label="Kirim pesan"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="p-2.5 rounded-full border border-border text-neutral-600 hover:bg-neutral-100 transition-colors"
                  aria-label="Hapus pesan"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>

              <p className="text-xs text-neutral-500 mt-2">
                Percakapan dengan asisten AI KWU. Data pribadi tidak dikumpulkan tanpa persetujuan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

