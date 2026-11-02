/**
 * Uji keamanan otomatis KWU (check 27).
 *
 * Pemakaian:
 *   1. npm run build
 *   2. npm run start -- -p 3100        (mode berkas/lokal)
 *   3. node scripts/uji-keamanan.mjs http://localhost:3100
 *
 * Uji berjalan terhadap server LOKAL. Jangan diarahkan ke produksi.
 * Mencakup: check 07 (XSS statis), 11/02 (secret di bundle), 12 (rate
 * limit), 14 (header), 16 (CSRF), 19 (harga server), 20 (bocor galat),
 * 23 (berkas terekspos). Check yang butuh akun Supabase nyata (01, 03, 05,
 * 09, 15, 17) dicatat sebagai langkah manual di SECURITY_REPORT.md.
 *
 * Data uji di data/kwu.json dipulihkan setelah selesai.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "http://localhost:3100";
const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB = path.join(AKAR, "data", "kwu.json");

const hasil = [];
function catat(nama, lolos, keterangan) {
  hasil.push({ nama, lolos, keterangan });
  console.log(`${lolos ? "LOLOS" : "GAGAL"} - ${nama}: ${keterangan}`);
}

async function kirim(method, url, { body, headers } = {}) {
  try {
    const res = await fetch(BASE + url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body,
    });
    const teks = await res.text();
    return { status: res.status, teks, ok: true };
  } catch (err) {
    return { status: 0, teks: String(err), ok: false };
  }
}

const polaBocor = [
  /node_modules/,
  /C:\\Users/,
  /\/src\/app\//,
  /select\s+\w+\s+from\s+/i,
  /"detail":"[^"]*sql/i,
];

/* ------------------------------------------------------------------ */
/* 07: sumber tanpa dangerouslySetInnerHTML                            */
/* ------------------------------------------------------------------ */
function ujiXssStatis() {
  const akar = path.join(AKAR, "src");
  const berkas = [];
  const tumpukan = [akar];
  while (tumpukan.length) {
    const d = tumpukan.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) tumpukan.push(p);
      else if (/\.(tsx|ts)$/.test(e.name)) berkas.push(p);
    }
  }
  const berbahaya = berkas.filter((f) =>
    /dangerouslySetInnerHTML|innerHTML\s*=/.test(fs.readFileSync(f, "utf8"))
  );
  catat(
    "07 tidak ada dangerouslySetInnerHTML",
    berbahaya.length === 0,
    `memeriksa ${berkas.length} berkas, pelanggaran=${berbahaya.length}`
  );
}

/* ------------------------------------------------------------------ */
/* 11/02: tidak ada secret di bundle produksi                          */
/* ------------------------------------------------------------------ */
function ujiSecretBundle() {
  const statis = path.join(AKAR, ".next", "static");
  if (!fs.existsSync(statis)) {
    catat("11/02 secret di bundle", false, ".next/static tidak ada: jalankan build dulu");
    return;
  }
  const pola = [
    /sb_secret_[A-Za-z0-9]{20,}/,
    /AQ\.[A-Za-z0-9_-]{20,}/,
    /sk_live_[A-Za-z0-9]{10,}/,
    /sk-ant-[A-Za-z0-9-]{10,}/,
    /AIza[A-Za-z0-9_-]{20,}/,
    /BEGIN PRIVATE KEY/,
    /ghp_[A-Za-z0-9]{30,}/,
  ];
  const berkas = [];
  const tumpukan = [statis];
  while (tumpukan.length) {
    const d = tumpukan.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) tumpukan.push(p);
      else if (e.name.endsWith(".js")) berkas.push(p);
    }
  }
  const cocok = [];
  for (const f of berkas) {
    const isi = fs.readFileSync(f, "utf8");
    for (const p of pola) {
      if (p.test(isi)) cocok.push(`${path.relative(AKAR, f)} :: ${p.source}`);
    }
  }
  catat(
    "11/02 secret di bundle produksi",
    cocok.length === 0,
    `memeriksa ${berkas.length} berkas js, kecocokan=${cocok.length}${cocok.length ? ` (${cocok.join("; ")})` : ""}`
  );
}

/* ------------------------------------------------------------------ */
/* 14: header keamanan                                                 */
/* ------------------------------------------------------------------ */
async function ujiHeader() {
  const res = await fetch(BASE + "/");
  const wajib = [
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy",
    "content-security-policy",
    "cross-origin-opener-policy",
    "cross-origin-resource-policy",
    "strict-transport-security",
  ];
  const hilang = wajib.filter((h) => !res.headers.has(h));
  catat("14 header keamanan lengkap", hilang.length === 0, `hilang=${hilang.join(",") || "tidak"}`);

  const csp = res.headers.get("content-security-policy") || "";
  catat(
    "14 CSP produksi ketat",
    csp.includes("upgrade-insecure-requests") && !csp.includes("unsafe-eval"),
    `upgrade=${csp.includes("upgrade-insecure-requests")} unsafe-eval=${csp.includes("unsafe-eval")}`
  );
}

/* ------------------------------------------------------------------ */
/* 16: CSRF Origin lintas-asal                                         */
/* ------------------------------------------------------------------ */
async function ujiCsrf() {
  const asing = await kirim("POST", "/api/orders", {
    body: JSON.stringify({ customerName: "Uji", customerEmail: "uji@x.test", deliveryAddress: "x", items: [{ productId: "p1", quantity: 1 }] }),
    headers: { Origin: "https://situs.jahat" },
  });
  catat("16 Origin asing ditolak 403", asing.status === 403, `status=${asing.status}`);

  const sendiri = await kirim("POST", "/api/rfqs", {
    body: JSON.stringify({ organizationName: "Uji" }),
    headers: { Origin: BASE },
  });
  catat("16 Origin sendiri lolos", sendiri.status !== 403, `status=${sendiri.status}`);

  const tanpa = await kirim("GET", "/api/products");
  catat("16 tanpa Origin diizinkan", tanpa.status === 200, `status=${tanpa.status}`);
}

/* ------------------------------------------------------------------ */
/* 19: harga dihitung server                                           */
/* ------------------------------------------------------------------ */
async function ujiHarga() {
  const db0 = JSON.parse(fs.readFileSync(DB, "utf8"));
  const produk = db0.products[0];

  const res = await kirim("POST", "/api/orders", {
    body: JSON.stringify({
      customerName: "Uji Harga",
      customerEmail: "uji@harga.test",
      deliveryAddress: "Alamat uji",
      items: [{ productId: produk.id, quantity: 2, unitPrice: 1, productName: "PALSU" }],
    }),
  });
  const db1 = JSON.parse(fs.readFileSync(DB, "utf8"));
  const baru = db1.orders[0];
  const harap = produk.price * 2;
  catat(
    "19 subtotal dari katalog, bukan klien",
    res.status === 201 && baru.subtotal === harap,
    `status=${res.status} subtotal=${baru?.subtotal} (harus ${harap})`
  );
  catat(
    "19 nama & harga item dari katalog",
    baru?.items?.[0]?.product_name === produk.name && baru?.items?.[0]?.unit_price === produk.price,
    `nama=${baru?.items?.[0]?.product_name} harga=${baru?.items?.[0]?.unit_price}`
  );

  const takDikenal = await kirim("POST", "/api/orders", {
    body: JSON.stringify({
      customerName: "Uji",
      customerEmail: "uji@harga.test",
      deliveryAddress: "Alamat uji",
      items: [{ productId: "tidak-ada", quantity: 1 }],
    }),
  });
  catat("19 produk tak dikenal ditolak", takDikenal.status >= 400 && takDikenal.status < 500, `status=${takDikenal.status}`);

  const lewatStok = await kirim("POST", "/api/orders", {
    body: JSON.stringify({
      customerName: "Uji",
      customerEmail: "uji@harga.test",
      deliveryAddress: "Alamat uji",
      items: [{ productId: produk.id, quantity: produk.stock + 1 }],
    }),
  });
  catat("19 quantity > stok ditolak", lewatStok.status >= 400 && lewatStok.status < 500, `status=${lewatStok.status}`);
}

/* ------------------------------------------------------------------ */
/* 06: validasi ketat                                                  */
/* ------------------------------------------------------------------ */
async function ujiValidasi() {
  const salahTipe = await kirim("POST", "/api/orders", {
    body: JSON.stringify({
      customerName: 123,
      customerEmail: "bukan-email",
      deliveryAddress: "x",
      items: "bukan-array",
    }),
  });
  catat("06 tipe salah ditolak 422", salahTipe.status === 422, `status=${salahTipe.status}`);

  const berlebih = await kirim("POST", "/api/rfqs", {
    body: JSON.stringify({
      organizationName: "Uji",
      contactName: "Uji",
      businessEmail: "uji@x.test",
      deliveryLocation: "Jakarta",
      items: [{ productName: "A", productDetails: "B", quantity: 1, unit: "pcs" }],
      role: "admin",
      status: "approved",
    }),
  });
  const dbAkhir = JSON.parse(fs.readFileSync(DB, "utf8"));
  const rfqBaru = dbAkhir.rfqs[0];
  const adaFieldTersembunyi = JSON.stringify(rfqBaru).includes('"role"');
  catat(
    "06 field berlebih (role/status) diabaikan",
    !adaFieldTersembunyi && (berlebih.status === 201 || berlebih.status === 422),
    `status=${berlebih.status} role-tersimpan=${adaFieldTersembunyi}`
  );
}

/* ------------------------------------------------------------------ */
/* 20: galat tidak bocor                                               */
/* ------------------------------------------------------------------ */
async function ujiGalat() {
  const jsonRusak = await kirim("POST", "/api/orders", { body: "{rusak" });
  const bocorJson = polaBocor.find((p) => p.test(jsonRusak.teks));
  catat(
    "20 JSON rusak -> 400 generik",
    jsonRusak.status === 400 && !bocorJson,
    `status=${jsonRusak.status} bocor=${bocorJson ? bocorJson.source : "tidak"}`
  );

  const res404 = await fetch(BASE + "/halaman-tidak-ada-987");
  const teks404 = await res404.text();
  const bocor404 = polaBocor.find((p) => p.test(teks404));
  catat(
    "20 404 halaman bersih",
    res404.status === 404 && !bocor404,
    `status=${res404.status} bocor=${bocor404 ? bocor404.source : "tidak"}`
  );

  const slug = await kirim("GET", "/api/produk/tidak-ada");
  const bocorSlug = polaBocor.find((p) => p.test(slug.teks));
  catat(
    "20 respons API galat bersih",
    slug.status >= 400 && !bocorSlug,
    `status=${slug.status} bocor=${bocorSlug ? bocorSlug.source : "tidak"}`
  );
}

/* ------------------------------------------------------------------ */
/* 23: berkas terekspos (lokal)                                        */
/* ------------------------------------------------------------------ */
async function ujiBerkasTerekspos() {
  const path = ["/.env", "/.env.local", "/.git/config", "/.git/HEAD", "/backup.zip", "/db.sql", "/dump.sql"];
  const berbahaya = [];
  for (const p of path) {
    const res = await fetch(BASE + p, { redirect: "manual" });
    if (![404, 401, 403].includes(res.status)) berbahaya.push(`${p}=${res.status}`);
  }
  catat(
    "23 path sensitif tidak disajikan",
    berbahaya.length === 0,
    `memeriksa ${path.length} path, bahaya=${berbahaya.join(",") || "tidak"}`
  );
}

/* ------------------------------------------------------------------ */
/* 12: rate limit + scope per rute (DIJALANKAN TERAKHIR)               */
/* ------------------------------------------------------------------ */
async function ujiRateLimit() {
  let jumlah429 = 0;
  for (let i = 0; i < 12; i += 1) {
    const res = await kirim("POST", "/api/orders", {
      body: JSON.stringify({ customerName: "", customerEmail: "salah" }),
    });
    if (res.status === 429) jumlah429 += 1;
  }
  catat("12 request ke-11+ menghasilkan 429", jumlah429 >= 2, `jumlah429=${jumlah429}`);

  const produk = await kirim("GET", "/api/products");
  catat(
    "12 scope per rute: /api/products tidak ikut terblokir",
    produk.status === 200,
    `status=${produk.status}`
  );
}

/* ------------------------------------------------------------------ */
/* Jalankan                                                            */
/* ------------------------------------------------------------------ */
const adaDb = fs.existsSync(DB);
const dbAwal = adaDb ? fs.readFileSync(DB, "utf8") : null;

try {
  console.log(`Target: ${BASE}\n`);
  ujiXssStatis();
  ujiSecretBundle();
  await ujiHeader();
  await ujiCsrf();
  if (adaDb) {
    await ujiHarga();
    await ujiValidasi();
  } else {
    catat("19/06 uji data lokal", false, "data/kwu.json tidak ditemukan");
  }
  await ujiGalat();
  await ujiBerkasTerekspos();
  await ujiRateLimit();
} finally {
  if (dbAwal !== null) fs.writeFileSync(DB, dbAwal, "utf8");
  console.log("\nData data/kwu.json dipulihkan.");
}

const gagal = hasil.filter((h) => !h.lolos);
console.log(`\nRingkasan: ${hasil.length - gagal.length} lolos, ${gagal.length} gagal dari ${hasil.length} uji.`);
if (gagal.length > 0) {
  console.log("Gagal:");
  for (const g of gagal) console.log(` - ${g.nama}: ${g.keterangan}`);
  process.exitCode = 1;
}
