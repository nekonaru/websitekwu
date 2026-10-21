-- Migrasi: data awal kategori dan produk KWU
-- Isi katalog awal agar toko siap dipakai setelah migrasi dijalankan.
-- Data di bawah ini sama dengan data contoh di src/lib/data.ts yang dipakai
-- sebagai fallback saat Supabase belum dikonfigurasi.

INSERT INTO categories (name, slug) VALUES
  ('Alat Tulis', 'alat-tulis'),
  ('Elektronik', 'elektronik'),
  ('Pakaian', 'pakaian'),
  ('Makanan & Minuman', 'makanan-minuman'),
  ('Kesehatan', 'kesehatan')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  name, slug, description, short_description, price, stock,
  category, image_url, is_featured, is_draft
) VALUES
  (
    'Buku Tulis Contoh A5',
    'buku-tulis-contoh-a5',
    'Buku tulis contoh untuk keperluan kuliah, kertas berkualitas, 60 lembar.',
    'Buku tulis contoh A5, 60 lembar.',
    15000, 120, 'alat-tulis',
    'https://placehold.co/400x500/orange/white?text=Buku+Tulis+Contoh+A5',
    true, false
  ),
  (
    'Tinta Bolpoin Contoh (12 pcs)',
    'tinta-bolpoin-contoh-12-pcs',
    'Set bolpoin contoh, 12 buah dalam satu kotak, tinta hitam.',
    'Set bolpoin 12 pcs.',
    48000, 50, 'alat-tulis',
    'https://placehold.co/400x500/blue/white?text=Tinta+Bolpoin+Contoh',
    true, false
  ),
  (
    'Kaos KWU Contoh',
    'kaos-kwu-contoh',
    'Kaos cotton contoh dengan logo KWU, berbagai ukuran.',
    'Kaos KWU contoh.',
    95000, 30, 'pakaian',
    'https://placehold.co/400x500/orange/white?text=Kaos+KWU+Contoh',
    true, false
  ),
  (
    'Power Bank Contoh 10000mAh',
    'power-bank-contoh-10000mah',
    'Power bank contoh kapasitas 10000mAh, dua port USB.',
    'Power bank 10000mAh.',
    185000, 15, 'elektronik',
    'https://placehold.co/400x500/blue/white?text=Power+Bank+10000mAh',
    true, false
  ),
  (
    'Snack Kotak Contoh',
    'snack-kotak-contoh',
    'Kotak rass contoh berbagai rasa, untuk stok kantin.',
    'Snack kotak contoh.',
    35000, 80, 'makanan-minuman',
    'https://placehold.co/400x500/orange/white?text=Snack+Kotak+Contoh',
    false, false
  ),
  (
    'Masker Kesehatan Contoh (50 pcs)',
    'masker-kesehatan-contoh-50-pcs',
    'Masker kesehatan contoh, kotak 50 lembar, 3 lapis.',
    'Masker kesehatan contoh.',
    65000, 100, 'kesehatan',
    'https://placehold.co/400x500/blue/white?text=Masker+Kesehatan',
    false, false
  )
ON CONFLICT (slug) DO NOTHING;
