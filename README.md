<div align="center">
  <h1>KWU: Toko Kampus</h1>
  <p><b>Website toko kampus dengan dua jalur transaksi: B2C (katalog, keranjang, checkout) dan B2B (permintaan penawaran grosir / RFQ),<br/>
  dilengkapi dashboard admin dan chatbot Asisten KWU.</b></p>

  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
</div>

<br />

> [!WARNING]
> Jangan pernah meng-commit `.env.local` atau secret apa pun ke repository. Service-role key Supabase dan kredensial AI hanya boleh berada di server atau environment variables.

---

## Daftar Isi

- [Tentang](#tentang)
- [Fitur](#fitur)
- [Stack](#stack)
- [Persyaratan](#persyaratan)
- [Cara Menjalankan (Pengembangan)](#cara-menjalankan-pengembangan)
- [Konfigurasi Supabase (Backend)](#konfigurasi-supabase-backend)
- [Variabel Environment](#variabel-environment)
- [Perintah yang Tersedia](#perintah-yang-tersedia)
- [Struktur Folder](#struktur-folder)
- [Catatan Implementasi](#catatan-implementasi)
- [Item Terbuka](#item-terbuka)
- [Keamanan](#keamanan)

---

## Tentang

**KWU: Toko Kampus** adalah website toko kampus dengan dua jalur transaksi: **B2C** (katalog, keranjang, checkout) dan **B2B** (permintaan penawaran grosir / RFQ), dilengkapi dashboard admin dan chatbot Asisten KWU.

---

## Fitur

### Etalase (B2C)

| Fitur | Keterangan |
|-------|------------|
| **Katalog produk** | Filter kategori, pencarian, dan pagination |
| **Detail produk** | Satu halaman detail per produk, diakses lewat slug |
| **Keranjang** | State keranjang global (context + localStorage) |
| **Checkout** | Checkout B2C |
| **Pesanan saya** | Riwayat pesanan per pengguna |
| **Autentikasi** | Login dan register lewat Supabase Auth, plus halaman profil pengguna |

### Bisnis (B2B)

| Fitur | Keterangan |
|-------|------------|
| **Formulir RFQ** | Formulir permintaan penawaran grosir |
| **Konfirmasi RFQ** | Halaman konfirmasi per nomor RFQ |
| **Quotation** | Quotation dan konversi ke pesanan |

### Admin

| Fitur | Keterangan |
|-------|------------|
| **Dashboard** | Dashboard admin |
| **Kelola produk & stok** | Mengelola produk dan stok |
| **Kelola RFQ dan quotation** | Mengelola RFQ dan quotation |
| **Kelola pesanan** | Mengelola pesanan |

### Asisten

| Fitur | Keterangan |
|-------|------------|
| **Chatbot Asisten KWU** | Endpoint chatbot di `api/chat`, memakai fallback aturan bila `AI_PROVIDER`, `AI_API_KEY`, atau `AI_MODEL` belum diisi |

---

## Stack

| Teknologi | Fungsi |
|-----------|--------|
| [Next.js](https://nextjs.org/) 16 (App Router, Turbopack) + TypeScript | Framework aplikasi |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Styling (design tokens) |
| [Supabase](https://supabase.com/) PostgreSQL + Supabase Auth | Database dan autentikasi |
| [Zod](https://zod.dev/) | Validasi skema di backend |
| [lucide-react](https://lucide.dev/) | Ikon |

---

## Persyaratan

| Dependensi | Catatan |
|------------|---------|
| **Node.js dan npm** | Diperlukan untuk menginstal dependensi dan menjalankan proyek |
| **Proyek Supabase** | Database dan autentikasi |
| **Personal access token Supabase** | Hanya diperlukan untuk skrip `npm run migrate`, diambil dari dashboard Supabase |

---

## Cara Menjalankan (Pengembangan)

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

---

## Konfigurasi Supabase (Backend)

Buat database Supabase lalu jalankan seluruh migrasi di `supabase/migrations/` secara berurutan.

### Opsi A: Pakai skrip bawaan (paling praktis)

Butuh personal access token dari dashboard Supabase:

```bash
export SUPABASE_ACCESS_TOKEN="sbp_xxx"
export SUPABASE_PROJECT_REF="ref-proyek-anda"
npm run migrate
```

### Opsi B: Jalankan berkas SQL secara manual

Jalankan tiap berkas `.sql` di `supabase/migrations/` melalui SQL Editor Supabase secara berurutan:

| Berkas | Isi |
|--------|-----|
| `001_create_rfq_tables.sql` | RFQ, item RFQ, riwayat status, quotation |
| `002_create_orders_tables.sql` | Pesanan dan item pesanan |
| `003_create_products_tables.sql` | Produk dan kategori |

---

## Variabel Environment

Isi di `.env.local`.

| Variabel | Cakupan | Keterangan |
|----------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Publik | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publik | Anon key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Khusus server | Service-role key Supabase |
| `AI_PROVIDER` | Khusus backend | Provider AI untuk chatbot |
| `AI_API_KEY` | Khusus backend | API key AI untuk chatbot |
| `AI_MODEL` | Khusus backend | Model AI untuk chatbot |
| `NEXT_PUBLIC_KWU_EMAIL` | Publik, opsional | Email resmi toko, dipakai pada halaman Kontak |
| `NEXT_PUBLIC_KWU_TELEPON` | Publik, opsional | Nomor telepon resmi toko, dipakai pada halaman Kontak |
| `NEXT_PUBLIC_KWU_ALAMAT` | Publik, opsional | Alamat resmi toko, dipakai pada halaman Kontak |

> [!IMPORTANT]
> Jangan di-commit `.env.local` ke repository. Variabel AI diisi di backend saja (tidak ke browser).

---

## Perintah yang Tersedia

| Perintah | Keterangan |
|----------|------------|
| `npm run dev` | Jalankan server development |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan server produksi |
| `npm run lint` | Jalankan ESLint |
| `npm run migrate` | Jalankan migrasi database ke Supabase |

---

## Struktur Folder

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

---

## Catatan Implementasi

- Bahasa antarmuka: Bahasa Indonesia.
- Zona waktu operasional: Asia/Jakarta.
- Halaman yang butuh data dinamis dimuat dari sisi klien lewat API route agar proses build tidak bergantung pada koneksi database.
- Data contoh di `src/lib/data.ts` hanya dipakai sebagai fallback saat Supabase belum dikonfigurasi.
- KWU tidak menyediakan layanan pengantaran maupun penjemputan, sehingga tidak ada biaya atau jadwal pengiriman yang ditampilkan.
- Service-role key Supabase tidak pernah disertakan di bundle browser.

---

## Item Terbuka

- Migrasi RLS memerlukan `raw_auth_meta_data.role` diisi admin melalui Supabase Auth.
- Peran admin belum memiliki halaman manajemen pengguna terpisah.
- API chatbot memakai fallback aturan bila `AI_PROVIDER`, `AI_API_KEY`, atau `AI_MODEL` belum diisi.
- Pengujian responsivitas, aksesibilitas, dan keamanan perlu dilakukan pada perangkat nyata.
- Kebijakan retensi data harus ditetapkan bersama pengelola kampus.

---

## Keamanan

- Secret dan service-role key hanya berada di server atau environment variables.
- Semua endpoint yang mengubah data divalidasi di backend dengan Zod.
- Secret asli tidak disimpan di repository.
