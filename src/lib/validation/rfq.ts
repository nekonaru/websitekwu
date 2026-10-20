/**
 * Skema validasi RFQ (digunakan API backend).
 * Backend adalah sumber kebenaran; validasi frontend hanya pelengkap.
 */
import { z } from "zod";

export const createRfqItemSchema = z.object({
  productName: z.string().min(5, "Detail produk minimal 5 karakter").max(2000),
  productDetails: z.string().min(5, "Detail produk minimal 5 karakter").max(2000),
  quantity: z
    .number()
    .int()
    .positive("Jumlah harus bilangan bulat positif")
    .max(10000, "Jumlah melebihi batas maksimum"),
  unit: z.string().min(1, "Satuan wajib dipilih"),
});

export const createRfqSchema = z.object({
  organizationName: z.string().trim().min(2).max(150),
  contactName: z.string().trim().min(2).max(100),
  businessEmail: z.string().email().toLowerCase().max(254),
  deliveryLocation: z.string().trim().max(500).optional().default("-"),
  requiredDate: z.string().refine((d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(d) >= today;
  }, "Tanggal kebutuhan tidak boleh sebelum hari ini"),
  items: z.array(createRfqItemSchema).min(1).max(20),
});
