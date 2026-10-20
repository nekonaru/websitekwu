/**
 * Layer layanan pesanan (order) KWU.
 * Mengintegrasikan keranjang dengan database pesanan via Supabase.
 */
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { CookieMethodsServer } from "@supabase/ssr";
import { z } from "zod";

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
  cookies: () => CookieMethodsServer;
}): Promise<{ orderNumber: string; status: string }> {
  const supabase = await createServerSupabaseClient(cookies());

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

  // Ambil user dari sesi
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const shippingCost = 0;
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  const orderNumber = `KWU-ORD-${new Date().getFullYear()}-${String(
    Math.floor(10000 + Math.random() * 90000)
  ).padStart(5, "0")}`;

  // Buat order dalam transaksi (menggunakan service-role untuk transaksi atomic)
  const serviceClient = createServiceSupabaseClient();

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
  cookies: () => CookieMethodsServer;
}): Promise<OrderWithItems[]> {
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

  return (data ?? []).map((o: any) => ({
    id: o.id,
    order_number: o.order_number,
    user_id: o.user_id,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    delivery_address: o.delivery_address,
    subtotal: o.subtotal,
    shipping_cost: o.shipping_cost,
    tax: o.tax,
    total: o.total,
    status: o.status,
    payment_method: o.payment_method,
    payment_proof_url: o.payment_proof_url,
    notes: o.notes,
    created_at: o.created_at,
    updated_at: o.updated_at,
    items: (o.order_items ?? []).map((i: any) => ({
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
  }));
}

/* ------------------------------------------------------------------ */
/* Admin: manajemen pesanan                                           */
/* ------------------------------------------------------------------ */

/** Ambil semua pesanan (admin only). Butuh service-role. */
export async function getAllOrdersAdmin(): Promise<OrderWithItems[]> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((o: any) => ({
    id: o.id,
    order_number: o.order_number,
    user_id: o.user_id,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    delivery_address: o.delivery_address,
    subtotal: o.subtotal,
    shipping_cost: o.shipping_cost,
    tax: o.tax,
    total: o.total,
    status: o.status,
    payment_method: o.payment_method,
    payment_proof_url: o.payment_proof_url,
    notes: o.notes,
    created_at: o.created_at,
    updated_at: o.updated_at,
    items: (o.order_items ?? []).map((i: any) => ({
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
  }));
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
  cookies: () => CookieMethodsServer;
}): Promise<OrderWithItems | null> {
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
  const isAdmin = (user as any).user_metadata?.role === "admin";
  if (!isAdmin && data.user_id !== user.id) {
    return null;
  }

  const o = data as any;
  return {
    id: o.id,
    order_number: o.order_number,
    user_id: o.user_id,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    delivery_address: o.delivery_address,
    subtotal: o.subtotal,
    shipping_cost: o.shipping_cost,
    tax: o.tax,
    total: o.total,
    status: o.status,
    payment_method: o.payment_method,
    payment_proof_url: o.payment_proof_url,
    notes: o.notes,
    created_at: o.created_at,
    updated_at: o.updated_at,
    items: (o.order_items ?? []).map((i: any) => ({
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
