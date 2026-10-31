/**
 * API Route: POST /api/rfqs
 * Buat RFQ baru beserta item dalam satu transaksi atomik.
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { createRfqSchema } from "@/lib/validation/rfq";
import {
  bacaBasisData,
  tulisBasisData,
  buatId,
  buatNomorRfq,
  type RfqBerkas,
} from "@/lib/file-db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  // Batasi 5 pengajuan RFQ per 5 menit per IP untuk mencegah spam.
  const diblokir = tanggapiJikaMelebihi(req, 5, 5 * 60_000);
  if (diblokir) return diblokir;

  try {
    const body = await req.json();

    const parsed = createRfqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { organizationName, contactName, businessEmail, deliveryLocation, requiredDate, items } = parsed.data;

    // Mode berkas lokal: simpan RFQ ke data/kwu.json.
    if (!isSupabaseConfigured()) {
      const db = await bacaBasisData();
      const sekarang = new Date().toISOString();
      const tahun = new Date().getFullYear();
      const nomor =
        db.rfqs.filter((r) => r.rfq_number.includes(`-${tahun}-`)).length + 1;

      const rfq: RfqBerkas = {
        id: buatId(),
        rfq_number: buatNomorRfq(tahun, nomor),
        organization_name: organizationName,
        contact_name: contactName,
        business_email: businessEmail,
        delivery_location: deliveryLocation,
        required_date: requiredDate,
        status: "submitted",
        created_by: "pengguna-lokal",
        assigned_to: null,
        admin_notes: null,
        created_at: sekarang,
        updated_at: sekarang,
        items: items.map((item) => ({
          id: buatId(),
          rfq_id: "",
          product_id: null,
          product_name: item.productName,
          product_details: item.productDetails,
          quantity: item.quantity,
          unit: item.unit,
          created_at: sekarang,
        })),
        history: [
          {
            id: buatId(),
            rfq_id: "",
            old_status: null,
            new_status: "submitted",
            changed_by: "pengguna-lokal",
            note: "RFQ diajukan",
            created_at: sekarang,
          },
        ],
      };
      rfq.items.forEach((i) => (i.rfq_id = rfq.id));
      rfq.history.forEach((h) => (h.rfq_id = rfq.id));

      db.rfqs.unshift(rfq);
      await tulisBasisData(db);

      return NextResponse.json(
        { success: true, data: { rfqNumber: rfq.rfq_number, status: "submitted" } },
        { status: 201 }
      );
    }

    const supabase = await createServerSupabaseClient(toSupabaseCookieStore(await cookies()));
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Nomor RFQ dihasilkan oleh sequence di database agar aman terhadap
    // request bersamaan.
    const { data: rfqNumber, error: numberError } = await supabase.rpc(
      "generate_rfq_number"
    );

    if (numberError) throw numberError;

    const { data: rfq, error: rfqError } = await supabase
      .from("rfqs")
      .insert({
        rfq_number: rfqNumber,
        organization_name: organizationName,
        contact_name: contactName,
        business_email: businessEmail,
        delivery_location: deliveryLocation,
        required_date: requiredDate,
        status: "submitted",
        created_by: user?.id ?? null,
      })
      .select()
      .single();

    if (rfqError) throw rfqError;

    const { error: itemsError } = await supabase.from("rfq_items").insert(
      items.map((item) => ({
        rfq_id: rfq.id,
        product_name: item.productName,
        product_details: item.productDetails,
        quantity: item.quantity,
        unit: item.unit,
      }))
    );

    if (itemsError) throw itemsError;

    return NextResponse.json(
      { success: true, data: { rfqNumber, status: "submitted" } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/rfqs error:", err);
    const message = err instanceof Error ? err.message : "Gagal membuat RFQ";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
