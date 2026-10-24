/**
 * API Route: POST /api/chat
 * Endpoint chatbot Asisten KWU. Provider AI dipanggil hanya dari backend.
 * API key tidak pernah ke browser.
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY = 10;

const SYSTEM_PROMPT = [
  "Kamu adalah Asisten KWU, asisten virtual toko kampus KWU.",
  "Jawab dalam Bahasa Indonesia yang ramah, ringkas, dan jelas.",
  "Informasi toko: katalog alat tulis, elektronik, pakaian, makanan, dan kesehatan.",
  "Cara memesan: pilih produk di katalog, masukkan ke keranjang, lalu checkout.",
  "Untuk kebutuhan grosir atau institusi, ajukan Request for Quotation (RFQ) melalui halaman Layanan Bisnis.",
  "KWU tidak menyediakan layanan pengantaran maupun penjemputan barang, jadi jangan menjanjikan pengiriman atau pengambilan barang.",
  "Jangan mengarang harga, stok, atau nomor pesanan. Jika tidak tahu, arahkan pengguna ke katalog atau admin KWU.",
].join(" ");

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

/** Balasan cadangan saat provider AI tidak tersedia atau gagal. */
function fallbackReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("produk") || lower.includes("cari")) {
    return "Saya bisa membantu kamu mencari produk di katalog KWU. Silakan buka halaman Katalog atau ketik nama produk yang kamu cari.";
  }
  if (lower.includes("pesan") || lower.includes("checkout")) {
    return "Untuk memesan, pilih produk di katalog, masukkan ke keranjang, lalu lanjutkan checkout. Pembayaran dikonfirmasi setelah admin meninjau.";
  }
  if (
    lower.includes("rfq") ||
    lower.includes("grosir") ||
    lower.includes("bisnis")
  ) {
    return "Untuk kebutuhan grosir/institusi, ajukan Request for Quotation (RFQ) melalui halaman Layanan Bisnis. Admin akan meninjau dan memberikan penawaran resmi.";
  }
  if (lower.includes("kontak") || lower.includes("admin")) {
    return "Anda dapat menghubungi admin KWU melalui halaman Kontak atau tombol 'Hubungi admin' di chat ini.";
  }
  return "Saya Asisten KWU. Saya bisa membantu tentang produk, cara pemesanan, status pesanan, dan layanan B2B. Silakan tanyakan atau pilih quick reply.";
}

/** Panggil Gemini API untuk membalas percakapan. */
async function callGemini(
  message: string,
  history: ChatTurn[]
): Promise<string | null> {
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!key || !model) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const contents = [
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      parts: [{ text: turn.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    console.error("Gemini API error:", response.status, await response.text());
    return null;
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  return text.length > 0 ? text : null;
}

/** Panggil API kompatibel OpenAI untuk membalas percakapan. */
async function callOpenAi(
  message: string,
  history: ChatTurn[]
): Promise<string | null> {
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!key || !model) return null;

  const baseUrl =
    process.env.AI_BASE_URL?.replace(/\/$/, "") ??
    "https://api.openai.com/v1";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((turn) => ({ role: turn.role, content: turn.text })),
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    console.error(
      "OpenAI-compatible API error:",
      response.status,
      await response.text()
    );
    return null;
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = payload.choices?.[0]?.message?.content?.trim();
  return text && text.length > 0 ? text : null;
}

export async function POST(req: Request) {
  // Batasi 20 pesan per menit per IP untuk melindungi biaya provider AI.
  const diblokir = tanggapiJikaMelebihi(req, 20, 60_000);
  if (diblokir) return diblokir;

  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Pesan wajib diisi" },
        { status: 422 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Pesan tidak boleh kosong" },
        { status: 422 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Pesan terlalu panjang (maks ${MAX_MESSAGE_LENGTH} karakter)`,
        },
        { status: 422 }
      );
    }

    const riwayat: ChatTurn[] = Array.isArray(history)
      ? history
          .filter(
            (turn): turn is ChatTurn =>
              typeof turn?.text === "string" &&
              (turn?.role === "user" || turn?.role === "assistant")
          )
          .slice(-MAX_HISTORY)
      : [];

    // Cek konfigurasi AI (hanya dari backend)
    const provider = process.env.AI_PROVIDER?.toLowerCase();
    const hasAI = Boolean(
      provider && process.env.AI_API_KEY && process.env.AI_MODEL
    );

    let reply: string | null = null;

    if (hasAI) {
      try {
        if (provider === "google" || provider === "gemini") {
          reply = await callGemini(message, riwayat);
        } else {
          reply = await callOpenAi(message, riwayat);
        }
      } catch (err) {
        console.error("Gagal memanggil provider AI:", err);
        reply = null;
      }
    }

    if (!reply) {
      reply = fallbackReply(message);
    }

    return NextResponse.json({ success: true, reply });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(err, "Layanan chat tidak tersedia saat ini"),
      },
      { status: 500 }
    );
  }
}
