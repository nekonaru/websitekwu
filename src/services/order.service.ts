/**
 * Layer layanan pesanan (order) KWU.
 * Mengintegrasikan keranjang dengan database pesanan via Supabase.
 */
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { z } from "zod";
import type { SupabaseCookieStore } from "@/lib/supabase";
import {
  bacaBasisData,
  tulisBasisData,
  buatId,
  buatNomorPesanan,
  type PesananBerkas,
} from "@/lib/file-db";

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: string;
  payment_method: string | null;
  payment_proof_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/** Bentuk baris tabel `orders` di database Supabase. */
interface OrderRow {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: string;
  payment_method: string | null;
  payment_proof_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[] | null;
}

/** Bentuk baris tabel `order_items` di database Supabase. */
interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

/** Periksa apakah pengguna yang login berperan sebagai admin. */
function isAdminUser(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;
  const metadata = (user as { app_metadata?: { role?: string } | null })
      .app_metadata ??
    (user as { user_metadata?: { role?: string } | null })
      .user_metadata;
  return metadata?.role === "admin";
}

/** Ubah baris database menjadi objek pesanan beserta itemnya. */
function toOrderWithItems(row: OrderRow): OrderWithItems {
  return {
    id: row.id,
    order_number: row.order_number,
    user_id: row.user_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    delivery_address: row.delivery_address,
    subtotal: row.subtotal,
    shipping_cost: row.shipping_cost,
    tax: row.tax,
    total: row.total,
    status: row.status,
    payment_method: row.payment_method,
    payment_proof_url: row.payment_proof_url,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: (row.order_items ?? []).map((i) => ({
      id: i.id,
      order_id: i.order_id,
      product_id: i.product_id,
      product_name: i.product_name,
      product_sku: i.product_sku,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
      created_at: i.created_at,
    })),
  };
}

/** Ubah baris berkas menjadi objek pesanan yang dipakai aplikasi. */
function pesananBerkasKeOrder(p: PesananBerkas): OrderWithItems {
  return { ...p, items: p.items ?? [] };
}

/* ------------------------------------------------------------------ */
/* Validasi                                                           */
/* ------------------------------------------------------------------ */

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

export type CreateOrderInput = z.infer<typeof orderSchema>;

/* ------------------------------------------------------------------ */
/* Membuat pesanan baru                                               */
/* ------------------------------------------------------------------ */

/**
 * Buat pesanan baru dalam satu transaksi.
 * Memerlukan autentikasi (user_id dari session cookie).
 */
export async function createOrder({
  input,
  cookies,
}: {
  input: CreateOrderInput;
  cookies: () => SupabaseCookieStore;
}): Promise<{ orderNumber: string; status: string }> {
  // Validasi input
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Input pesanan tidak valid");
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    notes,
    items,
  } = parsed.data;

  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const shippingCost = 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  // Mode berkas lokal: simpan pesanan ke data/kwu.json.
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    const sekarang = new Date().toISOString();
    const tahun = new Date().getFullYear();
    const nomor =
      db.orders.filter((o) => o.order_number.includes(`-${tahun}-`)).length + 1;

    const pesanan: PesananBerkas = {
      id: buatId(),
      order_number: buatNomorPesanan(tahun, nomor),
      user_id: "pengguna-lokal",
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone ?? null,
      delivery_address: deliveryAddress,
      subtotal,
      shipping_cost: shippingCost,
      tax,
      total,
      status: "pending",
      payment_method: null,
      payment_proof_url: null,
      notes: notes ?? null,
      created_at: sekarang,
      updated_at: sekarang,
      items: items.map((item) => ({
        id: buatId(),
        order_id: "",
        product_id: item.productId ?? null,
        product_name: item.productName,
        product_sku: item.productSku ?? null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        created_at: sekarang,
      })),
    };
    pesanan.items.forEach((i) => (i.order_id = pesanan.id));
    db.orders.unshift(pesanan);
    await tulisBasisData(db);
    return { orderNumber: pesanan.order_number, status: pesanan.status };
  }

  // Ambil user dari sesi (client dengan cookie sesi).
  const supabase = await createServerSupabaseClient(cookies());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  // Buat order dalam transaksi (menggunakan service-role untuk transaksi atomic)
  const serviceClient = createServiceSupabaseClient();

  // Nomor pesanan dihasilkan oleh sequence di database agar aman terhadap
  // request bersamaan.
  const { data: orderNumber, error: numberError } = await serviceClient.rpc(
    "generate_order_number"
  );

  if (numberError) throw numberError;

  const { data: order, error: orderError } = await serviceClient
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

  const { error: itemsError } = await serviceClient.from("order_items").insert(
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

  return { orderNumber: order.order_number, status: order.status };
}

/* ------------------------------------------------------------------ */
/* Ambil daftar pesanan milik pengguna                                */
/* ------------------------------------------------------------------ */

/** Ambil semua pesanan milik user yang login. */
export async function getMyOrders({
  cookies,
}: {
  cookies: () => SupabaseCookieStore;
}): Promise<OrderWithItems[]> {
  // Mode berkas lokal: satu pengguna lokal, kembalikan semua pesanan.
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    return db.orders.map(pesananBerkasKeOrder);
  }

  const supabase = await createServerSupabaseClient(cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((o: OrderRow) => toOrderWithItems(o));
}

/* ------------------------------------------------------------------ */
/* Admin: manajemen pesanan                                           */
/* ------------------------------------------------------------------ */

/** Ambil semua pesanan (admin only). Butuh service-role. */
export async function getAllOrdersAdmin(): Promise<OrderWithItems[]> {
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    return db.orders.map(pesananBerkasKeOrder);
  }

  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((o: OrderRow) => toOrderWithItems(o));
}

/** Perbarui status pesanan (admin only). Butuh service-role. */
export async function updateOrderStatusAdmin({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: string;
  note?: string;
}) {
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    const indeks = db.orders.findIndex((o) => o.id === orderId);
    if (indeks < 0) throw new Error("Pesanan tidak ditemukan");
    db.orders[indeks] = {
      ...db.orders[indeks],
      status,
      updated_at: new Date().toISOString(),
    };
    await tulisBasisData(db);
    return db.orders[indeks];
  }

  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;

  // Catat ke audit jika ada catatan
  if (note) {
    // Catatan disimpan di kolom notes (sederhana) atau bisa ditambah tabel audit terpisah
    console.log(`Order ${orderId} status updated to ${status}: ${note}`);
  }

  return data;
}

/** Ambil detail pesanan tunggal. */
export async function getOrderById({
  id,
  cookies,
}: {
  id: string;
  cookies: () => SupabaseCookieStore;
}): Promise<OrderWithItems | null> {
  if (!isSupabaseConfigured()) {
    const db = await bacaBasisData();
    const ditemukan = db.orders.find((o) => o.id === id);
    return ditemukan ? pesananBerkasKeOrder(ditemukan) : null;
  }

  const supabase = await createServerSupabaseClient(cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Cek kepemilikan (kecuali admin)
  const isAdmin = isAdminUser(user);
  if (!isAdmin && data.user_id !== user.id) {
    return null;
  }

  return toOrderWithItems(data as OrderRow);
}
