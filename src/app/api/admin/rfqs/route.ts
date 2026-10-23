/**
 * API Route: GET /api/admin/rfqs
 * Daftar RFQ untuk admin dengan filter dan pagination.
 */
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/format";
import { cookies } from "next/headers";
import { getAllRfqsAdmin } from "@/services/rfq.service";
import { requireAdmin } from "@/lib/auth";
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
  try {
    const admin = await requireAdmin(
      toSupabaseCookieStore(await cookies())
    );
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 401 }
      );
    }

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
    console.error("GET /api/admin/rfqs error:", err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, "Gagal memuat daftar RFQ") },
      { status: 500 }
    );
  }
}
