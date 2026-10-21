"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { formatRupiah, getErrorMessage } from "@/lib/format";
import { z } from "zod";
import {
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShoppingCart,
} from "lucide-react";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(150),
  email: z.string().email("Format email tidak valid").max(254),
  phone: z.string().trim().min(8, "Nomor telepon minimal 8 angka").max(20),
  notes: z.string().max(1000).optional(),
});

type FieldName = "name" | "email" | "phone" | "notes";

const KELAS_INPUT =
  "w-full rounded-xl border bg-white px-4 py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-orange-100";

export default function Checkout() {
  const { items, subtotal, itemCount, clear } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  function updateField(field: FieldName, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
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
          deliveryAddress: "Pembelian melalui website KWU",
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

      setOrderNumber(data.data.orderNumber);
      setMessage({
        type: "success",
        text: `Pesanan ${data.data.orderNumber} berhasil dibuat.`,
      });
      clear();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: getErrorMessage(err, "Gagal membuat pesanan. Coba lagi."),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const kelasInput = (field: FieldName) =>
    `${KELAS_INPUT} ${
      errors[field]
        ? "border-danger-500 focus:border-danger-500 focus:ring-red-100"
        : "border-border focus:border-primary"
    }`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/keranjang"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-hover"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke
          Keranjang
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-heading md:text-3xl">Checkout</h1>
      <p className="mb-8 text-muted">
        Lengkapi data pemesan untuk menyelesaikan pesanan Anda.
      </p>

      {message && (
        <div
          role="status"
          className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            message.type === "success"
              ? "border-success-100 bg-success-50 text-success-800"
              : "border-danger-100 bg-danger-50 text-danger-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold">{message.text}</p>
            {orderNumber && (
              <Link
                href="/pesanan-saya"
                className="mt-2 inline-block font-semibold underline underline-offset-4"
              >
                Lihat riwayat pesanan
              </Link>
            )}
          </div>
        </div>
      )}

      {itemCount === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <ShoppingCart
            className="mx-auto mb-4 h-10 w-10 text-muted"
            aria-hidden="true"
          />
          <h2 className="mb-2 text-lg font-bold text-heading">
            Keranjang Anda kosong
          </h2>
          <p className="mb-6 text-sm text-muted">
            Pilih produk yang Anda butuhkan sebelum melanjutkan ke checkout.
          </p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start lg:gap-8">
          {/* Formulir */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-6 rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-7"
          >
            <fieldset>
              <legend className="mb-4 text-lg font-bold text-heading">
                Informasi Pemesan
              </legend>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Bidang
                  id="name"
                  label="Nama Lengkap"
                  wajib
                  error={errors.name?.[0]}
                  value={form.name}
                  onChange={(v) => updateField("name", v)}
                  className={kelasInput("name")}
                  autoComplete="name"
                  placeholder="Nama sesuai identitas"
                />
                <Bidang
                  id="email"
                  label="Email"
                  wajib
                  type="email"
                  error={errors.email?.[0]}
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  className={kelasInput("email")}
                  autoComplete="email"
                  placeholder="nama@contoh.com"
                />
                <Bidang
                  id="phone"
                  label="Nomor Telepon"
                  wajib
                  type="tel"
                  error={errors.phone?.[0]}
                  value={form.phone}
                  onChange={(v) => updateField("phone", v)}
                  className={kelasInput("phone")}
                  autoComplete="tel"
                  placeholder="08xxxxxxxxxx"
                />

                <div className="space-y-2 sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-semibold text-heading"
                  >
                    Catatan Pesanan
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className={`${kelasInput("notes")} resize-y`}
                    placeholder="Catatan tambahan untuk admin (opsional)"
                    aria-invalid={Boolean(errors.notes)}
                  />
                  {errors.notes?.[0] && (
                    <p className="text-xs font-medium text-danger-600">
                      {errors.notes[0]}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Membuat pesanan...
                </>
              ) : (
                "Buat Pesanan"
              )}
            </button>

            <p className="text-center text-xs leading-relaxed text-muted">
              Pesanan akan diproses oleh admin KWU. Pembaruan status pesanan
              dikirimkan ke alamat surel Anda.
            </p>
          </form>

          {/* Ringkasan pesanan */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-heading">
                Ringkasan Pesanan
              </h2>

              <ul className="mb-5 space-y-4">
                {items.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-heading">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted">
                          {item.quantity} × {formatRupiah(item.product.price)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold text-primary">
                      {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2.5 border-t border-border pt-4">
                <div className="flex justify-between text-sm text-muted">
                  <span>Subtotal ({itemCount} item)</span>
                  <span className="font-medium text-heading">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted">
                  <span>Biaya layanan</span>
                  <span className="font-medium text-heading">Rp 0</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-lg font-bold text-heading">Total</span>
                <span className="text-xl font-extrabold text-primary">
                  {formatRupiah(subtotal)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function Bidang({
  id,
  label,
  wajib,
  type = "text",
  error,
  value,
  onChange,
  className,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  wajib?: boolean;
  type?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-heading">
        {label} {wajib && <span className="text-danger-600">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        required={wajib}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
