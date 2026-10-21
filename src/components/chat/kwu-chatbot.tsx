"use client";

import { useState, useEffect, useRef } from "react";
import { Send, RefreshCw, Bot, X as CloseIcon, Loader2 } from "lucide-react";

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
  const panelRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Cari produk",
    "Cara memesan",
    "Lacak pesanan",
    "Layanan B2B",
    "Hubungi admin",
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Kunci scroll halaman dan fokuskan input saat panel terbuka.
  useEffect(() => {
    if (!open) return;

    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = sebelumnya;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const teks = input.trim();

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: teks,
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
      const riwayat = messages
        .filter((m) => !m.loading && m.content)
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: teks, history: riwayat }),
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
    inputRef.current?.focus();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6">
      {/* Tombol chat mengambang */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka Asisten KWU"
        aria-expanded={open}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-orange-500/35 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-2xl hover:shadow-orange-500/45 focus:outline-none focus:ring-4 focus:ring-orange-200 active:translate-y-0 ${
          open ? "pointer-events-none scale-90 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Bot className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Buka Asisten KWU</span>
      </button>

      {/* Panel chat */}
      {open && (
        <div
          className="fixed inset-0 z-[101] flex flex-col sm:inset-auto sm:bottom-6 sm:right-6 sm:z-[101] sm:h-[600px] sm:w-[420px]"
          role="dialog"
          aria-modal="true"
          aria-label="Asisten KWU"
        >
          {/* Lapisan gelap untuk layar kecil */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/40 backdrop-blur-sm animate-fade-in sm:hidden"
            aria-label="Tutup chat"
            tabIndex={-1}
          />

          <div
            ref={panelRef}
            className="relative flex h-full w-full flex-col overflow-hidden border border-border bg-white shadow-2xl animate-fade-in-scale sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" aria-hidden="true" />
                <span className="font-semibold">Asisten KWU</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={`h-2 w-2 rounded-full ${
                    connected ? "bg-green-300" : "bg-amber-300"
                  }`}
                  aria-hidden="true"
                />
                <span>{connected ? "Terhubung" : "Terputus"}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-white/85 transition-colors duration-200 hover:bg-white/15 hover:text-white"
                aria-label="Tutup chat"
              >
                <CloseIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div
              className="flex-1 space-y-4 overflow-y-auto p-4"
              ref={scrollRef}
              aria-live="polite"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex max-w-[85%] gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-primary text-white"
                        : "rounded-tl-sm bg-neutral-100 text-heading"
                    }`}
                  >
                    {msg.loading ? (
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                        Mengetik...
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <div className="border-t border-border bg-surface p-3">
              {/* Balasan cepat */}
              <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1">
                {quickReplies.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => addQuickReply(qr)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-border bg-white px-3.5 py-1.5 text-sm text-body transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  disabled={sending}
                  className="min-w-0 flex-1 rounded-full border border-border bg-white px-4 py-2.5 text-sm text-heading transition-shadow duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                  aria-label="Input pesan asisten"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-all duration-200 hover:bg-primary-hover disabled:opacity-50"
                  aria-label="Kirim pesan"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setInput("")}
                  disabled={!input}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:bg-neutral-100 hover:text-heading disabled:opacity-50"
                  aria-label="Hapus pesan"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>

              <p className="mt-2 text-center text-[11px] leading-relaxed text-muted">
                Percakapan dengan asisten AI KWU. Data pribadi tidak dikumpulkan
                tanpa persetujuan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
