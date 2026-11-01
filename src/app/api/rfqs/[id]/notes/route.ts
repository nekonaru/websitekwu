/**
 * API Route: POST /api/rfqs/[id]/notes
 * Tambah catatan internal admin pada RFQ.
 */
import { NextResponse } from "next/server";
import { responsGalat } from "@/lib/api-error";
import { tanggapiJikaMelebihi } from "@/lib/rate-limit";
import { cookies } from "next/headers";
import { addAdminNote } from "@/services/rfq.service";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { toSupabaseCookieStore } from "@/lib/supabase";
import type { SupabaseCookieStore } from "@/lib/supabase";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  note: z.string().min(1).max(1000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const diblokir = tanggapiJikaMelebihi(req, 20, 60_000);
  if (diblokir) return diblokir;

  try {
    const admin = await requireAdmin(toSupabaseCookieStore(await cookies()));
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Akses admin diperlukan" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const parsedParams = paramsSchema.safeParse({ id });
    if (!parsedParams.success) {
      return NextResponse.json(
        { success: false, error: "ID RFQ tidak valid" },
        { status: 422 }
      );
    }

    const body = await req.json();
    const parsedBody = bodySchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: parsedBody.error.flatten() },
        { status: 422 }
      );
    }

    await addAdminNote({
      rfqId: id,
      note: parsedBody.data.note,
      cookies: cookies as unknown as () => SupabaseCookieStore,
    });

    return NextResponse.json({
      success: true,
      data: { message: "Catatan internal berhasil ditambahkan" },
    });
  } catch (err: unknown) {
    return responsGalat(err, "POST /api/rfqs/[id]/notes", "Gagal menambah catatan");
  }
}
