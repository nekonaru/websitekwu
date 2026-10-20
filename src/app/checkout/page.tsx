"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { formatRupiah } from "@/lib/format";
import { z } from "zod";
import { ChevronLeft, AlertCircle } from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(150),
  email: z.string().email("Format email tidak valid").max(254),
  phone: z.string().trim().min(8, "Nomor telepon minimal 8 angka").max(20),
  address: z.string().trim().min(5, "Alamat minimal 5 karakter").max(500),
  notes: z.string().max(1000),
});

export default function Checkout() {
  const { items, subtotal, itemCount, clear } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      checkoutSchema.parse(form);
      setErrors({});
    } catch (err) {
      if (err instanceof z.ZodError) {
        const next: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const path = issue.path.join(".");
          if (!next[path]) next[path] = [];
          next[path].push(issue.message);
        }
        setErrors(next);
      }
      return;
    }

    if (itemCount === 0) {
      setMessage({ type: "error", text: "Keranjang Anda kosong." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          deliveryAddress: form.address,
          notes: form.notes,
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            productSku: i.product.slug,
            quantity: i.quantity,
            unitPrice: i.product.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat pesanan");

      setMessage({
        type: "success",
        text: `Pesanan ${data.data.orderNumber} berhasil dibuat.`,
      });
      clear();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat pesanan. Coba lagi.";
      setMessage({ type: "error", text: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/keranjang"
          className="text-sm text-primary hover:underline flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke Keranjang
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          } mb-6`}
        >
          {message.text}
        </div>
      )}

      {itemCount === 0 && (
        <div className="bg-neutral-50 border border-border rounded-xl p-12 text-center">
          <AlertCircle className="h-6 w-6 text-neutral-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-neutral-600">Keranjang Anda kosong.</p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors mt-4 inline-block"
          >
            Belanja Sekarang
          </Link>
        </div>
      )}

      {itemCount > 0 && (
        <form onSubmit={handleSubmit} className="space-y-6 bg-surface border border-border rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full pl-3 pr-4 py-2.5 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name ? "border-red-500" : ""
                }`}
                required
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full pl-3 pr-4 py-2.5 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? "border-red-500" : ""
                }`}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={`w-full pl-3 pr-4 py-2.5 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.phone ? "border-red-500" : ""
                }`}
                required
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone[0]}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-foreground">
                Catatan Pemesanan
              </label>
              <textarea
                id="address"
                rows={3}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={`w-full pl-3 pr-4 py-2.5 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.address ? "border-red-500" : ""
                }`}
                placeholder="Catatan tambahan untuk pesanan Anda (opsional)"
              ></textarea>
              {errors.address && (
                <p className="text-xs text-red-600">{errors.address[0]}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="notes" className="block text-sm font-medium text-foreground">
                Catatan Pesanan
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="w-full pl-3 pr-4 py-2.5 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Catatan tambahan untuk admin (opsional)"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h2 className="font-semibold text-foreground mb-4">Ringkasan Pesanan</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        fill
                        sizes="32px"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {item.quantity} × {formatRupiah(item.product.price)}
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-primary">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground pt-4 border-t border-border">
              <span>Total</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-primary text-white text-lg font-semibold hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/25"
          >
            {submitting ? "Membuat pesanan..." : "Buat Pesanan"}
          </button>

          <p className="text-sm text-neutral-600 text-center mt-4">
            Data ini adalah contoh untuk pengembangan. Pesanan akan diproses
            oleh admin KWU setelah terhubung ke database.
          </p>
        </form>
      )}
    </section>
  );
}
