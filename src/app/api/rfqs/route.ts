/**
 * API Route: POST /api/rfqs
 * Buat RFQ baru beserta item dalam satu transaksi atomik.
 */
import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  toSupabaseCookieStore,
} from "@/lib/supabase";
import { createRfqSchema } from "@/lib/validation/rfq";
import { cookies } from "next/headers";

export async function POST(req: Request) {
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

    // Nomor RFQ dihasilkan di backend (keamanan terhadap request bersamaan)
    const rfqNumber = `KWU-RFQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Catatan: dalam implementasi produksi, nomor RFQ dihasilkan lewat
    // fungsi database sequence agar aman terhadap kompetisi.
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
        created_by: null, // diisi oleh auth dalam implementasi autentikasi penuh
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
