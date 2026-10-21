import { redirect } from "next/navigation";

/**
 * Formulir tambah produk berada di halaman /admin/products.
 * Halaman ini diarahkan ke sana agar tidak ada menu kosong.
 */
export default function AdminProductsNew() {
  redirect("/admin/products");
}
