/**
 * API Route: POST /api/quotations
 * Buat quotation baru untuk RFQ (admin only).
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { createQuotation } from "@/services/quotation.service";
import { requireAdmin } from "@/lib/auth";
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
    const admin = await requireAdmin(toSupabaseCookieStore(await cookies()));
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 401 }
      );
    }

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
    console.error("POST /api/quotations error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal membuat quotation") },
      { status: 400 }
    );
  }
}
