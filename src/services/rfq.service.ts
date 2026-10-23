/**
 * Layer layanan RFQ KWU (lanjutan).
 * Mengelola status transition, riwayat status, dan daftar RFQ untuk admin.
 */
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase";
import { getQuotationsByRfq as getQuotationsByRfqFromQuotation } from "@/services/quotation.service";
import type { SupabaseCookieStore } from "@/lib/supabase";

export { getQuotationsByRfqFromQuotation as getQuotationsByRfq };

export interface Rfq {
  id: string;
  rfq_number: string;
  organization_name: string;
  contact_name: string;
  business_email: string;
  delivery_location: string;
  required_date: string;
  status: string;
  created_by: string | null;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RfqItem {
  id: string;
  rfq_id: string;
  product_id: string | null;
  product_name: string;
  product_details: string;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface RfqStatusHistory {
  id: string;
  rfq_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface RfqWithItems extends Rfq {
  items: RfqItem[];
  history: RfqStatusHistory[];
}

/** Bentuk baris tabel `rfqs` di database Supabase. */
interface RfqRow {
  id: string;
  rfq_number: string;
  organization_name: string;
  contact_name: string;
  business_email: string;
  delivery_location: string;
  required_date: string;
  status: string;
  created_by: string | null;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  rfq_items?: RfqItemRow[] | null;
  rfq_status_history?: RfqStatusHistoryRow[] | null;
}

/** Bentuk baris tabel `rfq_items` di database Supabase. */
interface RfqItemRow {
  id: string;
  rfq_id: string;
  product_id: string | null;
  product_name: string;
  product_details: string;
  quantity: number;
  unit: string;
  created_at: string;
}

/** Bentuk baris tabel `rfq_status_history` di database Supabase. */
interface RfqStatusHistoryRow {
  id: string;
  rfq_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  note: string | null;
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

/* ------------------------------------------------------------------ */
/* Ambil daftar RFQ (admin)                                           */
/* ------------------------------------------------------------------ */

/** Ambil semua RFQ untuk admin dengan filter dan pagination. */
export async function getAllRfqsAdmin({
  cookies,
  status,
  search,
  page = 1,
  pageSize = 10,
}: {
  cookies: () => SupabaseCookieStore;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rfqs: Rfq[]; total: number }> {
  const supabase = await createServerSupabaseClient(cookies());

  // Cek otorisasi admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  const isAdmin = isAdminUser(user);
  if (!isAdmin) {
    throw new Error("Hanya admin yang dapat mengakses daftar RFQ");
  }

  let query = supabase
    .from("rfqs")
    .select("*, rfq_items(count)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `rfq_number.ilike.%${search}%,organization_name.ilike.%${search}%,contact_name.ilike.%${search}%,business_email.ilike.%${search}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    rfqs: (data ?? []).map((r: RfqRow) => ({
      id: r.id,
      rfq_number: r.rfq_number,
      organization_name: r.organization_name,
      contact_name: r.contact_name,
      business_email: r.business_email,
      delivery_location: r.delivery_location,
      required_date: r.required_date,
      status: r.status,
      created_by: r.created_by,
      assigned_to: r.assigned_to,
      admin_notes: r.admin_notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
    })),
    total: count ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* Ambil detail RFQ                                                   */
/* ------------------------------------------------------------------ */

/** Ambil detail RFQ dengan items dan riwayat status. */
export async function getRfqById({
  id,
  cookies,
}: {
  id: string;
  cookies: () => SupabaseCookieStore;
}): Promise<RfqWithItems | null> {
  const supabase = await createServerSupabaseClient(cookies());

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  const isAdmin = isAdminUser(user);

  const { data, error } = await supabase
    .from("rfqs")
    .select("*, rfq_items(*), rfq_status_history(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Cek akses: admin semua, pemilik hanya RFQ miliknya
  if (!isAdmin && data.created_by !== user.id) {
    return null;
  }

  const r = data as RfqRow;
  return {
    id: r.id,
    rfq_number: r.rfq_number,
    organization_name: r.organization_name,
    contact_name: r.contact_name,
    business_email: r.business_email,
    delivery_location: r.delivery_location,
    required_date: r.required_date,
    status: r.status,
    created_by: r.created_by,
    assigned_to: r.assigned_to,
    admin_notes: r.admin_notes,
    created_at: r.created_at,
    updated_at: r.updated_at,
    items: (r.rfq_items ?? []).map((i: RfqItemRow) => ({
      id: i.id,
      rfq_id: i.rfq_id,
      product_id: i.product_id,
      product_name: i.product_name,
      product_details: i.product_details,
      quantity: i.quantity,
      unit: i.unit,
      created_at: i.created_at,
    })),
    history: (r.rfq_status_history ?? []).map((h: RfqStatusHistoryRow) => ({
      id: h.id,
      rfq_id: h.rfq_id,
      old_status: h.old_status,
      new_status: h.new_status,
      changed_by: h.changed_by,
      note: h.note,
      created_at: h.created_at,
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Transisi status RFQ                                                */
/* ------------------------------------------------------------------ */

/** Transisi yang diizinkan sesuai spesifikasi bab 6.5. */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  submitted: ["under_review", "rejected"],
  under_review: ["needs_information", "quoted", "rejected"],
  needs_information: ["under_review", "rejected"],
  quoted: ["negotiation", "accepted", "rejected", "expired"],
  negotiation: ["quoted", "accepted", "rejected", "expired"],
  accepted: ["converted_to_order"],
  rejected: [],
  expired: [],
  converted_to_order: [],
};

/** Perbarui status RFQ dengan pemeriksaan transisi sah (admin only). */
export async function updateRfqStatusAdmin({
  rfqId,
  newStatus,
  note,
  cookies,
}: {
  rfqId: string;
  newStatus: string;
  note?: string;
  cookies: () => SupabaseCookieStore;
}): Promise<{ oldStatus: string; newStatus: string }> {
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

  const isAdmin = isAdminUser(user);
  if (!isAdmin) {
    throw new Error("Hanya admin yang dapat mengubah status RFQ");
  }

  // Ambil RFQ saat ini
  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .select("id, rfq_number, status")
    .eq("id", rfqId)
    .single();

  if (rfqError || !rfq) {
    throw new Error("RFQ tidak ditemukan");
  }

  const oldStatus = rfq.status;

  // Cek transisi sah
  const allowed = ALLOWED_TRANSITIONS[oldStatus] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Transisi status dari ${oldStatus} ke ${newStatus} tidak diizinkan`
    );
  }

  // Status rejected butuh alasan
  if (newStatus === "rejected" && !note) {
    throw new Error("Status ditolak harus disertai alasan");
  }

  // Perbarui status
  const { error: updateError } = await serviceClient
    .from("rfqs")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...(note ? { admin_notes: note } : {}),
    })
    .eq("id", rfqId);

  if (updateError) throw updateError;

  // Catat riwayat status
  await serviceClient.from("rfq_status_history").insert({
    rfq_id: rfqId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: user.id,
    note: note ?? null,
    created_at: new Date().toISOString(),
  });

  return { oldStatus, newStatus };
}

/* ------------------------------------------------------------------ */
/* Catatan internal admin                                             */
/* ------------------------------------------------------------------ */

/** Tambah catatan internal admin pada RFQ. */
export async function addAdminNote({
  rfqId,
  note,
  cookies,
}: {
  rfqId: string;
  note: string;
  cookies: () => SupabaseCookieStore;
}): Promise<void> {
  const supabase = await createServerSupabaseClient(cookies());

  // Cek otorisasi admin
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Autentikasi diperlukan");
  }

  const isAdmin = isAdminUser(user);
  if (!isAdmin) {
    throw new Error("Hanya admin yang dapat menambah catatan");
  }

  const { error } = await supabase.from("rfqs").update({
    admin_notes: note,
    updated_at: new Date().toISOString(),
  }).eq("id", rfqId);

  if (error) throw error;
}
