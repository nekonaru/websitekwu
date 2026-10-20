/**
 * Layer layanan quotation KWU.
 * Mengelola pembuatan, pencantuman, dan konversi quotation ke pesanan B2B.
 */
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase";
import type { CookieMethodsServer } from "@supabase/ssr";
import { z } from "zod";

export interface Quotation {
  id: string;
  rfq_id: string;
  quotation_number: string;
  version: number;
  created_by: string | null;
  valid_until: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  terms: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  rfq_item_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface QuotationWithItems extends Quotation {
  items: QuotationItem[];
}

/* ------------------------------------------------------------------ */
/* Validasi                                                           */
/* ------------------------------------------------------------------ */

const quotationItemSchema = z.object({
  rfqItemId: z.string().optional(),
  productName: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  unit: z.string().min(1).max(30),
  unitPrice: z.number().nonnegative(),
});

const createQuotationSchema = z.object({
  rfqId: z.string().uuid(),
  validUntil: z.string().refine((d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(d) >= today;
  }, "Tanggal kedaluwarsa tidak boleh sebelum hari ini"),
  shippingCost: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  terms: z.string().max(1000).optional(),
  items: z.array(quotationItemSchema).min(1).max(50),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

/* ------------------------------------------------------------------ */
/* Membuat quotation baru                                             */
/* ------------------------------------------------------------------ */

/**
 * Buat quotation baru untuk RFQ dalam satu transaksi atomic.
 * Hanya admin yang dapat membuat quotation.
 * Versi quotation otomatis bertambah jika sudah ada quotation untuk RFQ tersebut.
 */
export async function createQuotation({
  input,
  cookies,
}: {
  input: CreateQuotationInput;
  cookies: () => CookieMethodsServer;
}): Promise<{
  quotationNumber: string;
  version: number;
  status: string;
}> {
  const supabase = await createServerSupabaseClient(cookies());
  const serviceClient = createServiceSupabaseClient();

  // Cek otorisasi admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  const isAdmin = (user as any).user_metadata?.role === "admin";
  if (!isAdmin) {
    throw new Error("Hanya admin yang dapat membuat quotation");
  }

  const parsed = createQuotationSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Input quotation tidak valid");
  }

  const { rfqId, validUntil, shippingCost, discount, terms, items } =
    parsed.data;

  // Cek RFQ ada dan statusnya memungkinkan quotation
  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .select("id, rfq_number, status")
    .eq("id", rfqId)
    .single();

  if (rfqError || !rfq) {
    throw new Error("RFQ tidak ditemukan");
  }

  const allowedStatuses = ["under_review", "quoted", "negotiation"];
  if (!allowedStatuses.includes(rfq.status)) {
    throw new Error(
      `RFQ tidak dapat dibuat quotation dalam status ${rfq.status}`
    );
  }

  // Hitung versi berikutnya
  const { data: existingQuotations } = await supabase
    .from("quotations")
    .select("version")
    .eq("rfq_id", rfqId)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = (existingQuotations?.[0]?.version ?? 0) + 1;

  const quotationNumber = `KWU-Q-${new Date().getFullYear()}-${String(
    Math.floor(10000 + Math.random() * 90000)
  ).padStart(5, "0")}`;

  // Hitung total
  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );
  const total = subtotal + shippingCost - discount;

  // Buat quotation (gunakan service-role untuk insert)
  const { data: quotation, error: qError } = await serviceClient
    .from("quotations")
    .insert({
      rfq_id: rfqId,
      quotation_number: quotationNumber,
      version: nextVersion,
      created_by: user.id,
      valid_until: validUntil,
      status: "draft",
      subtotal,
      shipping_cost: shippingCost,
      discount,
      total,
      terms: terms ?? null,
    })
    .select()
    .single();

  if (qError) throw qError;

  // Buat quotation items
  const { error: itemsError } = await serviceClient
    .from("quotation_items")
    .insert(
      items.map((item) => ({
        quotation_id: quotation.id,
        rfq_item_id: item.rfqItemId ?? null,
        product_name: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }))
    );

  if (itemsError) throw itemsError;

  // Terbitkan quotation: ubah status RFQ ke 'quoted' dan catat riwayat
  await serviceClient
    .from("rfqs")
    .update({ status: "quoted", updated_at: new Date().toISOString() })
    .eq("id", rfqId);

  await serviceClient.from("rfq_status_history").insert({
    rfq_id: rfqId,
    old_status: rfq.status,
    new_status: "quoted",
    changed_by: user.id,
    note: `Quotation ${quotationNumber} versi ${nextVersion} diterbitkan`,
    created_at: new Date().toISOString(),
  });

  // Buat quotation sebagai 'issued' (terbitkan)
  await serviceClient
    .from("quotations")
    .update({ status: "issued", updated_at: new Date().toISOString() })
    .eq("id", quotation.id);

  return {
    quotationNumber,
    version: nextVersion,
    status: "issued",
  };
}

/* ------------------------------------------------------------------ */
/* Ambil daftar quotation                                             */
/* ------------------------------------------------------------------ */

/** Ambil quotation milik RFQ tertentu (admin atau pemilik RFQ). */
export async function getQuotationsByRfq({
  rfqId,
  cookies,
}: {
  rfqId: string;
  cookies: () => CookieMethodsServer;
}): Promise<QuotationWithItems[]> {
  const supabase = await createServerSupabaseClient(cookies());

  const { data, error } = await supabase
    .from("quotations")
    .select("*, quotation_items(*)")
    .eq("rfq_id", rfqId)
    .order("version", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((q: any) => ({
    id: q.id,
    rfq_id: q.rfq_id,
    quotation_number: q.quotation_number,
    version: q.version,
    created_by: q.created_by,
    valid_until: q.valid_until,
    status: q.status,
    subtotal: q.subtotal,
    shipping_cost: q.shipping_cost,
    discount: q.discount,
    total: q.total,
    terms: q.terms,
    created_at: q.created_at,
    updated_at: q.updated_at,
    items: (q.quotation_items ?? []).map((i: any) => ({
      id: i.id,
      quotation_id: i.quotation_id,
      rfq_item_id: i.rfq_item_id,
      product_name: i.product_name,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      total_price: i.total_price,
      created_at: i.created_at,
    })),
  }));
}

/** Ambil semua quotation (admin only). */
export async function getAllQuotationsAdmin(): Promise<QuotationWithItems[]> {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("quotations")
    .select("*, quotation_items(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((q: any) => ({
    id: q.id,
    rfq_id: q.rfq_id,
    quotation_number: q.quotation_number,
    version: q.version,
    created_by: q.created_by,
    valid_until: q.valid_until,
    status: q.status,
    subtotal: q.subtotal,
    shipping_cost: q.shipping_cost,
    discount: q.discount,
    total: q.total,
    terms: q.terms,
    created_at: q.created_at,
    updated_at: q.updated_at,
    items: (q.quotation_items ?? []).map((i: any) => ({
      id: i.id,
      quotation_id: i.quotation_id,
      rfq_item_id: i.rfq_item_id,
      product_name: i.product_name,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      total_price: i.total_price,
      created_at: i.created_at,
    })),
  }));
}

/* ------------------------------------------------------------------ */
/* Status quotation                                                   */
/* ------------------------------------------------------------------ */

/** Perbarui status quotation (admin only). */
export async function updateQuotationStatusAdmin({
  quotationId,
  status,
}: {
  quotationId: string;
  status: "issued" | "accepted" | "rejected" | "expired" | "superseded";
}) {
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("quotations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", quotationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ------------------------------------------------------------------ */
/* Konversi quotation ke pesanan B2B                                  */
/* ------------------------------------------------------------------ */

/**
 * Konversi quotation yang sudah disetujui menjadi pesanan B2B.
 * Mencegah konversi ganda (idempotent).
 * Butuh service-role key.
 */
export async function convertQuotationToOrder({
  quotationId,
}: {
  quotationId: string;
}): Promise<{ orderNumber: string; status: string }> {
  const supabase = createServiceSupabaseClient();

  // Ambil quotation dengan items dan RFQ
  const { data: quotation, error: qError } = await supabase
    .from("quotations")
    .select("*, rfq_id, quotation_items(*)")
    .eq("id", quotationId)
    .single();

  if (qError || !quotation) {
    throw new Error("Quotation tidak ditemukan");
  }

  if (quotation.status !== "accepted") {
    throw new Error("Hanya quotation yang disetujui yang dapat dikonversi");
  }

  // Cek apakah sudah dikonversi (RFQ status sudah converted_to_order)
  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .select("id, rfq_number, status")
    .eq("id", quotation.rfq_id)
    .single();

  if (rfqError || !rfq) {
    throw new Error("RFQ tidak ditemukan");
  }

  if (rfq.status === "converted_to_order") {
    throw new Error("RFQ sudah dikonversi menjadi pesanan");
  }

  // Hitung total
  const subtotal = quotation.quotation_items.reduce(
    (sum: number, i: any) => sum + i.unit_price * i.quantity,
    0
  );
  const shippingCost = quotation.shipping_cost ?? 0;
  const discount = quotation.discount ?? 0;
  const total = subtotal + shippingCost - discount;

  const orderNumber = `KWU-ORD-${new Date().getFullYear()}-${String(
    Math.floor(10000 + Math.random() * 90000)
  ).padStart(5, "0")}`;

  // Buat pesanan B2B
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: quotation.created_by,
      customer_name: "", // akan diisi dari RFQ
      customer_email: "", // akan diisi dari RFQ
      customer_phone: null,
      delivery_address: "", // akan diisi dari RFQ
      subtotal,
      shipping_cost: shippingCost,
      tax: 0,
      total,
      status: "pending",
      payment_method: null,
      payment_proof_url: null,
      notes: `Dikonversi dari quotation ${quotation.quotation_number}`,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // Buat order items dari quotation items
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(
      quotation.quotation_items.map((i: any) => ({
        order_id: order.id,
        product_id: null,
        product_name: i.product_name,
        product_sku: null,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
      }))
    );

  if (itemsError) throw itemsError;

  // Perbarui RFQ status ke converted_to_order dan catat riwayat
  await supabase
    .from("rfqs")
    .update({ status: "converted_to_order", updated_at: new Date().toISOString() })
    .eq("id", quotation.rfq_id);

  await supabase.from("rfq_status_history").insert({
    rfq_id: quotation.rfq_id,
    old_status: rfq.status,
    new_status: "converted_to_order",
    changed_by: quotation.created_by,
    note: `Konversi quotation ${quotation.quotation_number} menjadi pesanan ${orderNumber}`,
    created_at: new Date().toISOString(),
  });

  // Tandai quotation sebagai terpakai (superseded jika ada versi baru nanti)
  await supabase
    .from("quotations")
    .update({ status: "issued", updated_at: new Date().toISOString() })
    .eq("id", quotationId);

  return { orderNumber: order.order_number, status: order.status };
}
