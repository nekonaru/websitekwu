/**
 * API Route: POST /api/orders
 * Buat pesanan B2C baru (dengan item) dalam satu transaksi.
 * Membutuhkan autentikasi (user_id dari session).
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { z } from "zod";
import { cookies } from "next/headers";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { createOrder } from "@/services/order.service";

const orderItemSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1).max(200),
  productSku: z.string().max(100).optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(150),
  customerEmail: z.string().email().max(254),
  customerPhone: z.string().max(30).optional(),
  deliveryAddress: z.string().trim().min(5).max(500),
  notes: z.string().max(1000).optional(),
  items: z.array(orderItemSchema).min(1).max(50),
});

export async function POST(req: Request) {
  // Batasi 10 pesanan per menit per IP untuk mencegah penyalahgunaan.
  const diblokir = tanggapiJikaMelebihi(req, 10, 60_000);
  if (diblokir) return diblokir;

  try {
    const body = await req.json();

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const cookieStore = toSupabaseCookieStore(await cookies());

    // Mode berkas lokal: tidak ada sesi login, langsung simpan sebagai
    // pengguna lokal lewat service.
    if (!isSupabaseConfigured()) {
      const hasil = await createOrder({
      input: parsed.data,
      cookies: () => cookieStore,
    });
      return NextResponse.json({ success: true, data: hasil }, { status: 201 });
    }

    const supabase = await createServerSupabaseClient(cookieStore);

    // Ambil user saat ini dari sesi (anon key + cookie)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    // Service membuat pesanan memakai nomor berurutan dari database,
    // sehingga aman terhadap request bersamaan (tanpa Math.random).
    const hasil = await createOrder({
      input: parsed.data,
      cookies: () => cookieStore,
    });

    return NextResponse.json({ success: true, data: hasil }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat pesanan";
    if (message === "Autentikasi diperlukan") {
      return NextResponse.json({ success: false, error: message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
