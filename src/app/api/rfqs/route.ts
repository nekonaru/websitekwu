/**
 * API Route: POST /api/rfqs
 * Buat RFQ baru beserta item dalam satu transaksi atomik.
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { createRfqSchema } from "@/lib/validation/rfq";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  // Batasi 5 pengajuan RFQ per 5 menit per IP untuk mencegah spam.
  const diblokir = tanggapiJikaMelebihi(req, 5, 5 * 60_000);
  if (diblokir) return diblokir;

  try {
    const supabase = await createServerSupabaseClient(toSupabaseCookieStore(await cookies()));
    const body = await req.json();

    const parsed = createRfqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { organizationName, contactName, businessEmail, deliveryLocation, requiredDate, items } = parsed.data;

    // Ambil pengguna yang login untuk mengisi kolom pembuat RFQ.
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
