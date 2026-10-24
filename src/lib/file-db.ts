/**
 * Basis data berkas lokal untuk pengembangan dan pengujian.
 *
 * Saat Supabase belum dikonfigurasi (atau saat pengembang memilih mode
 * berkas), data disimpan di berkas JSON di `data/kwu.json`. Semua operasi
 * dilakukan di sisi server agar aman.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { randomUUID } from "node:crypto";

const JALUR_BERKAS = join(process.cwd(), "data", "kwu.json");

export interface ProdukBerkas {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  is_featured: boolean;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface KategoriBerkas {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface PesananBerkas {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: string;
  payment_method: string | null;
  payment_proof_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: ItemPesananBerkas[];
}

export interface ItemPesananBerkas {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface RfqBerkas {
  id: string;
  rfq_number: string;
  organization_name: string;
  contact_name: string;
  business_email: string;
  delivery_location: string;
  required_date: string;
  status: string;
  created_by: string | null;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items: ItemRfqBerkas[];
  history: RiwayatRfqBerkas[];
}

export interface ItemRfqBerkas {
  id: string;
  rfq_id: string;
  product_id: string | null;
  product_name: string;
  product_details: string;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface RiwayatRfqBerkas {
  id: string;
  rfq_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface QuotationBerkas {
  id: string;
  rfq_id: string;
  quotation_number: string;
  version: number;
  created_by: string | null;
  valid_until: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  terms: string | null;
  created_at: string;
  updated_at: string;
  items: ItemQuotationBerkas[];
}

export interface ItemQuotationBerkas {
  id: string;
  quotation_id: string;
  rfq_item_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface BasisData {
  categories: KategoriBerkas[];
  products: ProdukBerkas[];
  orders: PesananBerkas[];
  rfqs: RfqBerkas[];
  quotations: QuotationBerkas[];
}

const DATA_AWAL: BasisData = {
  categories: [
    { id: "1", name: "Alat Tulis", slug: "alat-tulis", created_at: new Date().toISOString() },
    { id: "2", name: "Elektronik", slug: "elektronik", created_at: new Date().toISOString() },
    { id: "3", name: "Pakaian", slug: "pakaian", created_at: new Date().toISOString() },
    { id: "4", name: "Makanan & Minuman", slug: "makanan-minuman", created_at: new Date().toISOString() },
    { id: "5", name: "Kesehatan", slug: "kesehatan", created_at: new Date().toISOString() },
  ],
  products: [
    {
      id: "p1",
      name: "Buku Tulis Contoh A5",
      slug: "buku-tulis-contoh-a5",
      description: "Buku tulis contoh untuk keperluan kuliah, kertas berkualitas, 60 lembar.",
      short_description: "Buku tulis contoh A5, 60 lembar.",
      price: 15000,
      stock: 120,
      category: "alat-tulis",
      image_url: "https://placehold.co/400x500/orange/white.png?text=Buku+Tulis+Contoh+A5",
      is_featured: true,
      is_draft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p2",
      name: "Tinta Bolpoin Contoh (12 pcs)",
      slug: "tinta-bolpoin-contoh-12-pcs",
      description: "Set bolpoin contoh, 12 buah dalam satu kotak, tinta hitam.",
      short_description: "Set bolpoin 12 pcs.",
      price: 48000,
      stock: 50,
      category: "alat-tulis",
      image_url: "https://placehold.co/400x500/blue/white.png?text=Tinta+Bolpoin+Contoh",
      is_featured: true,
      is_draft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p3",
      name: "Kaos KWU Contoh",
      slug: "kaos-kwu-contoh",
      description: "Kaos cotton contoh dengan logo KWU, berbagai ukuran.",
      short_description: "Kaos KWU contoh.",
      price: 95000,
      stock: 30,
      category: "pakaian",
      image_url: "https://placehold.co/400x500/orange/white.png?text=Kaos+KWU+Contoh",
      is_featured: true,
      is_draft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p4",
      name: "Power Bank Contoh 10000mAh",
      slug: "power-bank-contoh-10000mah",
      description: "Power bank contoh kapasitas 10000mAh, dua port USB.",
      short_description: "Power bank 10000mAh.",
      price: 185000,
      stock: 15,
      category: "elektronik",
      image_url: "https://placehold.co/400x500/blue/white.png?text=Power+Bank+10000mAh",
      is_featured: true,
      is_draft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p5",
      name: "Snack Kotak Contoh",
      slug: "snack-kotak-contoh",
      description: "Kotak snack contoh berbagai rasa, untuk stok kantin.",
      short_description: "Snack kotak contoh.",
      price: 35000,
      stock: 80,
      category: "makanan-minuman",
      image_url: "https://placehold.co/400x500/orange/white.png?text=Snack+Kotak+Contoh",
      is_featured: false,
      is_draft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "p6",
      name: "Masker Kesehatan Contoh (50 pcs)",
      slug: "masker-kesehatan-contoh-50-pcs",
      description: "Masker kesehatan contoh, kotak 50 lembar, 3 lapis.",
      short_description: "Masker kesehatan contoh.",
      price: 65000,
      stock: 100,
      category: "kesehatan",
      image_url: "https://placehold.co/400x500/blue/white.png?text=Masker+Kesehatan",
      is_featured: false,
      is_draft: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  orders: [],
  rfqs: [],
  quotations: [],
};

let cache: BasisData | null = null;

export async function bacaBasisData(): Promise<BasisData> {
  if (cache) return cache;

  try {
    const raw = await readFile(JALUR_BERKAS, "utf8");
    cache = JSON.parse(raw) as BasisData;
    return cache;
  } catch {
    // Berkas belum ada, buat dari data awal.
    await mkdir(dirname(JALUR_BERKAS), { recursive: true });
    cache = structuredClone(DATA_AWAL);
    await tulisBasisData(cache);
    return cache;
  }
}

export async function tulisBasisData(data: BasisData): Promise<void> {
  cache = data;
  await mkdir(dirname(JALUR_BERKAS), { recursive: true });
  await writeFile(JALUR_BERKAS, JSON.stringify(data, null, 2), "utf8");
}

export function buatId(): string {
  return randomUUID();
}

export function buatNomorRfq(tahun: number, nomor: number): string {
  return `KWU-RFQ-${tahun}-${String(nomor).padStart(5, "0")}`;
}

export function buatNomorPesanan(tahun: number, nomor: number): string {
  return `KWU-ORD-${tahun}-${String(nomor).padStart(5, "0")}`;
}

export function buatNomorQuotation(tahun: number, nomor: number): string {
  return `KWU-Q-${tahun}-${String(nomor).padStart(5, "0")}`;
}
