/**
 * API Route: POST /api/quotations
 * Buat quotation baru untuk RFQ (admin only).
 */
import { NextResponse } from "next/server";
import { tolakBilaBukanAdmin } from "@/lib/api-auth";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { createQuotation } from "@/services/quotation.service";
import { z } from "zod";
import { toSupabaseCookieStore } from "@/lib/supabase";
import type { SupabaseCookieStore } from "@/lib/supabase";

const quotationItemSchema = z.object({
  rfqItemId: z.string().optional(),
  productName: z.string().min(1).max(200),
  quantity: z.number().int().positive(),
  unit: z.string().min(1).max(30),
  unitPrice: z.number().nonnegative(),
});

const bodySchema = z.object({
  rfqId: z.string().uuid(),
  validUntil: z.string(),
  shippingCost: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
  terms: z.string().max(1000).optional(),
  items: z.array(quotationItemSchema).min(1).max(50),
});

export async function POST(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 20, 60_000);
  if (diblokir) return diblokir;

  try {
    // Guard otorisasi di tingkat route: jangan biarkan service-role
    // dijalankan sebelum peran admin dipastikan.
    const hasilAdmin = await tolakBilaBukanAdmin(
      toSupabaseCookieStore(await cookies()),
      "quotations"
    );
    if ("response" in hasilAdmin) return hasilAdmin.response;

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const result = await createQuotation({
      input: parsed.data,
      cookies: cookies as unknown as () => SupabaseCookieStore,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          quotationNumber: result.quotationNumber,
          version: result.version,
          status: result.status,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return responsGalat(err, "POST /api/quotations", "Gagal membuat quotation");
  }
}
