/**
 * API Route: PATCH /api/admin/orders/[id]/status
 * Alias untuk kompatibilitas dengan frontend admin orders.
 * (Lihat route.ts di folder yang sama untuk implementasi lengkap)
 */
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Delegasi ke route.ts di level yang sama
  const { PATCH: handler } = require("./route");
  return handler(req, { params });
}
