/**
 * API Route: POST /api/chat
 * Endpoint chatbot Asisten KWU. Provider AI dipanggil hanya dari backend.
 * API key tidak pernah ke browser.
 */
import { NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

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
        { success: false, error: `Pesan terlalu panjang (maks ${MAX_MESSAGE_LENGTH} karakter)` },
        { status: 422 }
      );
    }

    // Cek konfigurasi AI (hanya dari backend)
    const hasAI =
      process.env.AI_PROVIDER &&
      process.env.AI_API_KEY &&
      process.env.AI_MODEL;

    let reply: string;

    if (!hasAI) {
      // Fallback ramis ketika AI tidak dikonfigurasi
      const lower = message.toLowerCase();
      if (lower.includes("produk") || lower.includes("cari")) {
        reply =
          "Saya bisa membantu kamu mencari produk di katalog KWU. Silakan buka halaman Katalog atau ketik nama produk yang kamu cari.";
      } else if (lower.includes("pesan") || lower.includes("checkout")) {
        reply =
          "Untuk memesan, pilih produk di katalog, masukkan ke keranjang, lalu lanjutkan checkout. Pembayaran dikonfirmasi setelah admin meninjau.";
      } else if (lower.includes("rfq") || lower.includes("grosir") || lower.includes("bisnis")) {
        reply =
          "Untuk kebutuhan grosir/institusi, ajukan Request for Quotation (RFQ) melalui halaman Layanan Bisnis. Admin akan meninjau dan memberikan penawaran resmi.";
      } else if (lower.includes("kontak") || lower.includes("admin")) {
        reply =
          "Anda dapat menghubungi admin KWU melalui halaman Kontak atau tombol 'Hubungi admin' di chat ini.";
      } else {
        reply =
          "Saya Asisten KWU. Saya bisa membantu tentang produk, cara pemesanan, pengiriman, dan layanan B2B. Silakan tanyakan atau pilih quick reply.";
      }
    } else {
      // Panggil provider AI dari backend (diimplementasikan sesuai konfigurasi)
      reply =
        "Maaf, asisten AI belum dikonfigurasi sepenuhnya. Silakan hubungi admin untuk bantuan langsung.";
    }

    return NextResponse.json({ success: true, reply });
  } catch (err) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      { success: false, error: "Layanan chat tidak tersedia saat ini" },
      { status: 500 }
    );
  }
}
