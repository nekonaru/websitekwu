/**
 * Menjalankan seluruh migrasi di supabase/migrations ke proyek Supabase.
 *
 * Cara pakai:
 *   1. Buat personal access token di dashboard Supabase
 *      (Account Settings > Access Tokens).
 *   2. Jalankan dengan environment variable berikut:
 *        SUPABASE_ACCESS_TOKEN  personal access token
 *        SUPABASE_PROJECT_REF   ref proyek, contoh: nxunbpinnnswurgmbja
 *
 * Contoh:
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_xxx"
 *   $env:SUPABASE_PROJECT_REF="nxunbpinnnswurgmbja"
 *   npm run migrate
 */
import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRASI_DIR = join(__dirname, "..", "supabase", "migrations");

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!token || !projectRef) {
  console.error(
    "SUPABASE_ACCESS_TOKEN dan SUPABASE_PROJECT_REF wajib diisi."
  );
  process.exit(1);
}

const files = (await readdir(MIGRASI_DIR))
  .filter((name) => name.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("Tidak ada berkas migrasi yang ditemukan.");
  process.exit(0);
}

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

for (const file of files) {
  const sql = await readFile(join(MIGRASI_DIR, file), "utf8");

  process.stdout.write(`Menjalankan ${file} ... `);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });

    const body = await response.text();

    if (!response.ok) {
      console.log("GAGAL");
      console.error(body);
      process.exit(1);
    }

    console.log("berhasil");
  } catch (err) {
    console.log("GAGAL");
    console.error(err);
    process.exit(1);
  }
}

console.log("Semua migrasi selesai dijalankan.");
