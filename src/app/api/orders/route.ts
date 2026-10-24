/**
 * API Route: POST /api/orders
 * Buat pesanan B2C baru (dengan item) dalam satu transaksi.
 * Membutuhkan autentikasi (user_id dari session).
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { z } from "zod";
import { cookies } from "next/headers";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";

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
    const supabase = await createServerSupabaseClient(toSupabaseCookieStore(await cookies()));
    const body = await req.json();

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      notes,
      items,
    } = parsed.data;

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

    const subtotal = items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
    const shippingCost = 0; // gratis dalam contoh
    const tax = 0;
    const total = subtotal + shippingCost + tax;

    const orderNumber = `KWU-ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone ?? null,
        delivery_address: deliveryAddress,
        subtotal,
        shipping_cost: shippingCost,
        tax,
        total,
        status: "pending",
        notes: notes ?? null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId ?? null,
        product_name: item.productName,
        product_sku: item.productSku ?? null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }))
    );

    if (itemsError) throw itemsError;

    return NextResponse.json(
      {
        success: true,
        data: { orderNumber: order.order_number, status: "pending" },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat pesanan";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
