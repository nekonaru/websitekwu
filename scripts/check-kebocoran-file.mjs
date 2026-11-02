/**
 * Pemeriksaan berkas terekspos (check 23).
 *
 * Pemakaian: node scripts/check-kebocoran-file.mjs https://domain-anda
 *
 * Meminta deretan path sensitif ke domain MILIK SENDIRI dan melaporkan
 * kode status tiap path. Semua baris harus 404 (atau 401/403); kode 200
 * berarti berkas bisa diunduh publik dan wajib ditangani segera.
 */
const domain = process.argv[2];

if (!domain) {
  console.error("Pakai: node scripts/check-kebocoran-file.mjs https://domain-anda");
  process.exit(1);
}
if (!/^https?:\/\//.test(domain)) {
  console.error("Domain harus diawali http:// atau https://");
  process.exit(1);
}

const dasar = domain.replace(/\/$/, "");

const pathTersensitif = [
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.env.development",
  "/.env.backup",
  "/.env.bak",
  "/.env.old",
  "/.git/config",
  "/.git/HEAD",
  "/.gitignore",
  "/.DS_Store",
  "/.vscode/settings.json",
  "/.idea/workspace.xml",
  "/backup.zip",
  "/backup.tar.gz",
  "/db.sql",
  "/dump.sql",
  "/database.sql",
  "/database.sqlite",
  "/data.db",
  "/config.json",
  "/config.yml",
  "/docker-compose.yml",
  "/.npmrc",
  "/phpinfo.php",
  "/server-status",
  "/swagger.json",
  "/openapi.json",
  "/graphql",
  "/api/seed",
  "/api/debug",
  "/api/env",
  "/docs",
  "/redoc",
];

const AMAN = new Set([404, 401, 403, 405]);
const berbahaya = [];

const hasil = await Promise.all(
  pathTersensitif.map(async (p) => {
    try {
      const res = await fetch(dasar + p, { redirect: "manual" });
      return { path: p, status: res.status };
    } catch (err) {
      return { path: p, status: "ERR", pesan: String(err) };
    }
  })
);

for (const { path: p, status, pesan } of hasil) {
  const tanda = AMAN.has(status) ? "aman " : "BAHAYA";
  console.log(`${tanda} ${String(status).padEnd(4)} ${dasar}${p}${pesan ? ` (${pesan})` : ""}`);
  if (!AMAN.has(status)) berbahaya.push({ path: p, status });
}

// Berkas .map di bawah aset statis.
for (const p of ["/_next/static/chunks/main.js.map", "/_next/static/chunks/app/layout.js.map"]) {
  try {
    const res = await fetch(dasar + p, { redirect: "manual" });
    const tanda = AMAN.has(res.status) ? "aman " : "BAHAYA";
    console.log(`${tanda} ${String(res.status).padEnd(4)} ${dasar}${p} (source map)`);
    if (!AMAN.has(res.status)) berbahaya.push({ path: p, status: res.status });
  } catch {
    /* lewati */
  }
}

console.log(`\nRingkasan: ${hasil.length} path diperiksa, ${berbahaya.length} berbahaya.`);
if (berbahaya.length > 0) process.exitCode = 1;
