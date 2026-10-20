/**
 * API Route: POST /api/rfqs/[id]/notes
 * Tambah catatan internal admin pada RFQ.
 */
import { NextResponse } from "next/server";
import { addAdminNote } from "@/services/rfq.service";
import { z } from "zod";

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
  try {
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
      cookies: (() => {
        const { cookies } = require("next/headers");
        return cookies();
      })() as any,
    });

    return NextResponse.json({
      success: true,
      data: { message: "Catatan internal berhasil ditambahkan" },
    });
  } catch (err: any) {
    console.error("POST /api/rfqs/[id]/notes error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "Gagal menambah catatan" },
      { status: 400 }
    );
  }
}
