/**
 * API Route: GET /api/admin/rfqs
 * Daftar RFQ untuk admin dengan filter dan pagination.
 */
import { NextResponse } from "next/server";
import { tolakBilaBukanAdmin } from "@/lib/api-auth";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { getAllRfqsAdmin } from "@/services/rfq.service";
import { toSupabaseCookieStore } from "@/lib/supabase";
import { z } from "zod";
import type { SupabaseCookieStore } from "@/lib/supabase";

const querySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform((val) => parseInt(val, 10) || 1).optional(),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10) || 10)
    .optional(),
});

export async function GET(req: Request) {
  const diblokir = tanggapiJikaMelebihi(req, 30, 60_000);
  if (diblokir) return diblokir;

  try {
    const hasilAdmin = await tolakBilaBukanAdmin(
      toSupabaseCookieStore(await cookies()),
      "admin/rfqs"
    );
    if ("response" in hasilAdmin) return hasilAdmin.response;

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const result = await getAllRfqsAdmin({
      cookies: cookies as unknown as () => SupabaseCookieStore,
      status: parsed.data.status,
      search: parsed.data.search,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    return responsGalat(err, "GET /api/admin/rfqs", "Gagal memuat daftar RFQ");
  }
}
