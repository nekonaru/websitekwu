# KWU - Toko Kampus

Website toko kampus dengan dua jalur transaksi: **B2C** (katalog, keranjang, checkout) dan **B2B** (permintaan penawaran grosir / RFQ), dilengkapi dashboard admin dan chatbot Asisten KWU.

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router, Turbopack) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4 (design tokens)
- [Supabase](https://supabase.com/) PostgreSQL + Supabase Auth
- [Zod](https://zod.dev/) untuk validasi skema di backend
- [lucide-react](https://lucide.dev/) untuk ikon

## Struktur folder (ringkas)

```
src/
  app/                    # Route Next.js App Router
    page.tsx              # Beranda
    katalog/              # Katalog produk (filter kategori, pencarian, pagination)
    produk/[slug]/        # Detail produk
    keranjang/            # Keranjang (context + localStorage)
    checkout/             # Checkout B2C
    pesanan-saya/         # Riwayat pesanan pengguna
    login/ register/      # Autentikasi Supabase
    profil/               # Profil pengguna
    business/rfq/new/     # Formulir RFQ B2B
    business/rfq/confirmation/[rfqNumber]/  # Konfirmasi RFQ
    admin/                # Dashboard admin
    admin/products/       # Kelola produk & stok
    admin/rfqs/           # Kelola RFQ dan quotation
    admin/orders/         # Kelola pesanan
    api/products/         # Katalog publik
    api/produk/[slug]/    # Detail produk
    api/orders/           # Buat pesanan B2C
    api/my/orders/        # Pesanan milik pengguna
    api/rfqs/             # Buat dan kelola RFQ
    api/quotations/       # Quotation dan konversi ke pesanan
    api/admin/            # Endpoint admin (produk, pesanan, RFQ)
    api/chat/             # Endpoint chatbot Asisten KWU
  components/
    layout/               # Header, Footer
    business/             # RfqForm
    chat/                 # KwuChatbot (Asisten KWU)
  contexts/
    cart-context.tsx      # State keranjang global
  lib/
    format.ts             # formatRupiah, formatDate, slugify, getErrorMessage
    data.ts               # Data contoh (mock) sebagai fallback
    supabase.ts           # Klien Supabase (browser, server, service-role)
  services/
    product.service.ts    # Layer layanan produk
    order.service.ts      # Layer layanan pesanan
    rfq.service.ts        # Layer layanan RFQ
    quotation.service.ts  # Layer layanan quotation
  types/
    rfq.ts                # Tipe data RFQ
supabase/
  migrations/             # Skema tabel untuk RFQ, pesanan, dan produk
```

## Cara menjalankan (pengembangan)

1. Salin `.env.example` menjadi `.env.local` dan isi nilai yang relevan.
   ```bash
   cp .env.example .env.local
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm run dev
   ```
4. Buka `http://localhost:3000`.

## Konfigurasi Supabase (backend)

Buat database Supabase lalu jalankan seluruh migrasi di `supabase/migrations/` secara berurutan.

Cara paling praktis lewat skrip bawaan (butuh personal access token dari dashboard Supabase):

```bash
export SUPABASE_ACCESS_TOKEN="sbp_xxx"
export SUPABASE_PROJECT_REF="ref-proyek-anda"
npm run migrate
```

Alternatifnya, jalankan tiap berkas `.sql` di `supabase/migrations/` melalui SQL Editor Supabase secara berurutan:

- `001_create_rfq_tables.sql` (RFQ, item RFQ, riwayat status, quotation)
- `002_create_orders_tables.sql` (pesanan dan item pesanan)
- `003_create_products_tables.sql` (produk dan kategori)

Variabel yang harus diisi di `.env.local` (jangan di-commit ke repository):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (khusus server)

Untuk AI (chatbot), isi di backend saja (tidak ke browser):

- `AI_PROVIDER`
- `AI_API_KEY`
- `AI_MODEL`

Kontak resmi toko (opsional, dipakai pada halaman Kontak):

- `NEXT_PUBLIC_KWU_EMAIL`
- `NEXT_PUBLIC_KWU_TELEPON`
- `NEXT_PUBLIC_KWU_ALAMAT`

## Perintah yang tersedia

| Perintah | Keterangan |
|----------|------------|
| `npm run dev` | Jalankan server development |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan server produksi |
| `npm run lint` | Jalankan ESLint |
| `npm run migrate` | Jalankan migrasi database ke Supabase |

## Catatan implementasi

- Bahasa antarmuka: Bahasa Indonesia.
- Zona waktu operasional: Asia/Jakarta.
- Halaman yang butuh data dinamis dimuat dari sisi klien lewat API route agar proses build tidak bergantung pada koneksi database.
- Data contoh di `src/lib/data.ts` hanya dipakai sebagai fallback saat Supabase belum dikonfigurasi.
- KWU tidak menyediakan layanan pengantaran maupun penjemputan, sehingga tidak ada biaya atau jadwal pengiriman yang ditampilkan.
- Service-role key Supabase tidak pernah disertakan di bundle browser.

## Item terbuka

- Migrasi RLS memerlukan `raw_auth_meta_data.role` diisi admin melalui Supabase Auth.
- Peran admin belum memiliki halaman manajemen pengguna terpisah.
- API chatbot memakai fallback aturan bila `AI_PROVIDER`, `AI_API_KEY`, atau `AI_MODEL` belum diisi.
- Pengujian responsivitas, aksesibilitas, dan keamanan perlu dilakukan pada perangkat nyata.
- Kebijakan retensi data harus ditetapkan bersama pengelola kampus.

## Keamanan

- Secret dan service-role key hanya berada di server atau environment variables.
- Semua endpoint yang mengubah data divalidasi di backend dengan Zod.
- Secret asli tidak disimpan di repository.
