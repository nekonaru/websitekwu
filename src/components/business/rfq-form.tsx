"use client";

import { useState } from "react";
import { z, ZodError } from "zod";
import { Plus, Minus, Mail, Building2, Trash2 } from "lucide-react";
import type { CreateRfqInput } from "@/types/rfq";

// Skema validasi RFQ (frontend; backend juga divalidasi terpisah)
const rfqItemSchema = z.object({
  productName: z.string().min(5, "Detail produk minimal 5 karakter").max(2000),
  productDetails: z.string().min(5, "Detail produk minimal 5 karakter").max(2000),
  quantity: z.coerce.number().int().positive("Jumlah harus bilangan bulat positif"),
  unit: z.string().min(1, "Satuan wajib dipilih"),
});

const rfqFormSchema = z.object({
  organizationName: z.string().trim().min(2, "Minimal 2 karakter").max(150),
  contactName: z.string().trim().min(2, "Minimal 2 karakter").max(100),
  businessEmail: z.string().email("Format email tidak valid").toLowerCase().max(254),
  deliveryLocation: z.string().trim().max(500).optional().default("-"),
  requiredDate: z.string().refine((d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(d) >= today;
  }, "Tanggal kebutuhan tidak boleh sebelum hari ini"),
  items: z.array(rfqItemSchema).min(1, "Minimal satu produk").max(20),
});

const DEFAULT_UNITS = ["pcs", "unit", "box", "pack", "lainnya"];

type RfqItemForm = z.infer<typeof rfqItemSchema>;

interface RfqFormProps {
  onSubmit: (data: CreateRfqInput) => Promise<void>;
  loading: boolean;
}

export function RfqForm({ onSubmit, loading }: RfqFormProps) {
  const [form, setForm] = useState<CreateRfqInput>({
    organizationName: "",
    contactName: "",
    businessEmail: "",
    deliveryLocation: "-",
    requiredDate: "",
    items: [{ productName: "", productDetails: "", quantity: 1, unit: "pcs" }],
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const addItem = () => {
    if (form.items.length >= 20) return;
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productName: "", productDetails: "", quantity: 1, unit: "pcs" }],
    }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm((prev) => {
      const next = [...prev.items];
      next.splice(index, 1);
      return { ...prev, items: next };
    });
  };

  const updateField = (itemIndex: number, field: keyof RfqItemForm, value: string | number) => {
    setForm((prev) => {
      const next = [...prev.items];
      next[itemIndex] = { ...next[itemIndex], [field]: value };
      return { ...prev, items: next };
    });
  };

  const updateTopField = (field: keyof CreateRfqInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setHasSubmitted(true);

    try {
      rfqFormSchema.parse(form);
      setErrors({});
      await onSubmit(form);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ZodError) {
        const next: Record<string, string[]> = {};
        for (const issue of err.issues) {
          const path = issue.path.join(".");
          if (!next[path]) next[path] = [];
          next[path].push(issue.message);
        }
        // Error item indeks
        for (const issue of err.issues) {
          const path = issue.path.join(".");
          const m = path.match(/^items\.(\d+)\.(.+)$/);
          if (m) {
            const idx = parseInt(m[1], 10);
            const field = m[2];
            if (!next[`items_${idx}_${field}`]) next[`items_${idx}_${field}`] = [];
            next[`items_${idx}_${field}`].push(issue.message);
          }
        }
        setErrors(next);
      } else {
        setServerError("Terjadi kesalahan. Coba lagi.");
      }
    }
  };

  if (submitted) {
    return null; // Halaman konfirmasi ditangani routing
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {serverError && (
        <div className="p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-800 text-sm">
          {serverError}
        </div>
      )}

      {/* Informasi perusahaan */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-heading flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
          Informasi Perusahaan / Institusi
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-heading">
              Nama Perusahaan / Institusi <span className="text-danger-600">*</span>
            </label>
            <input
              name="organizationName"
              value={form.organizationName}
              onChange={(e) => updateTopField("organizationName", e.target.value)}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100 ${
                errors.organizationName ? "border-danger-500" : ""
              }`}
              required
            />
            {hasSubmitted && errors.organizationName && (
              <p className="text-xs text-danger-600">{errors.organizationName[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-heading">
              Nama Kontak <span className="text-danger-600">*</span>
            </label>
            <input
              name="contactName"
              value={form.contactName}
              onChange={(e) => updateTopField("contactName", e.target.value)}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100 ${
                errors.contactName ? "border-danger-500" : ""
              }`}
              required
            />
            {hasSubmitted && errors.contactName && (
              <p className="text-xs text-danger-600">{errors.contactName[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-heading">
              Email Bisnis <span className="text-danger-600">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" aria-hidden="true" />
              <input
                name="businessEmail"
                type="email"
                value={form.businessEmail}
                onChange={(e) => updateTopField("businessEmail", e.target.value)}
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100 ${
                  errors.businessEmail ? "border-danger-500" : ""
                }`}
                required
              />
            </div>
            {hasSubmitted && errors.businessEmail && (
              <p className="text-xs text-danger-600">{errors.businessEmail[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Detail kebutuhan grosir */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-heading">
          Detail Kebutuhan Grosir
        </h2>
        <div className="space-y-3">
          {form.items.map((item, index) => (
            <div
              key={index}
              className="border border-border rounded-xl p-4 bg-neutral-50 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase">
                  Produk {index + 1}
                </span>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-neutral-400 hover:text-danger-600 p-1.5"
                    aria-label="Hapus produk ini"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-heading">
                    Nama Produk / SKU <span className="text-danger-600">*</span>
                  </label>
                  <input
                    value={item.productName}
                    onChange={(e) => updateField(index, "productName", e.target.value)}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100 ${
                      errors[`items_${index}_productName`] ? "border-danger-500" : ""
                    }`}
                    placeholder="Contoh: Buku Tulis A5"
                    required
                  />
                  {hasSubmitted && errors[`items_${index}_productName`] && (
                    <p className="text-xs text-danger-600">
                      {errors[`items_${index}_productName`][0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-heading">
                    Satuan <span className="text-danger-600">*</span>
                  </label>
                  <select
                    value={item.unit}
                    onChange={(e) => updateField(index, "unit", e.target.value)}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100 ${
                      errors[`items_${index}_unit`] ? "border-danger-500" : ""
                    }`}
                  >
                    {DEFAULT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {hasSubmitted && errors[`items_${index}_unit`] && (
                    <p className="text-xs text-danger-600">{errors[`items_${index}_unit`][0]}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-heading">
                  Detail Produk / Spesifikasi <span className="text-danger-600">*</span>
                </label>
                <textarea
                  value={item.productDetails}
                  onChange={(e) => updateField(index, "productDetails", e.target.value)}
                  rows={3}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100 ${
                    errors[`items_${index}_productDetails`] ? "border-danger-500" : ""
                  }`}
                  placeholder="Spesifikasi, varian, atau kebutuhan khusus"
                  required
                ></textarea>
                {hasSubmitted && errors[`items_${index}_productDetails`] && (
                  <p className="text-xs text-danger-600">
                    {errors[`items_${index}_productDetails`][0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-heading">
                  Jumlah <span className="text-danger-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        index,
                        "quantity",
                        Math.max(1, (item.quantity || 1) - 1)
                      )
                    }
                    disabled={item.quantity <= 1}
                    className="w-10 h-10 rounded-lg border border-border hover:bg-neutral-100 flex items-center justify-center"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) =>
                      updateField(index, "quantity", parseInt(e.target.value, 10) || 1)
                    }
                    className="w-16 rounded-xl border border-border bg-white px-2 py-2.5 text-center text-heading shadow-soft transition-shadow duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-orange-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => updateField(index, "quantity", (item.quantity || 1) + 1)}
                    className="w-10 h-10 rounded-lg border border-border hover:bg-neutral-100 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {hasSubmitted && errors[`items_${index}_quantity`] && (
                  <p className="text-xs text-danger-600">
                    {errors[`items_${index}_quantity`][0]}
                  </p>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            disabled={form.items.length >= 20 || loading}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Produk Lain
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-heading">
              Tanggal Kebutuhan <span className="text-danger-600">*</span>
            </label>
            <input
              type="date"
              value={form.requiredDate}
              onChange={(e) => updateTopField("requiredDate", e.target.value)}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-heading shadow-soft transition-shadow duration-200 placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:border-primary focus:ring-orange-100 ${
                errors.requiredDate ? "border-danger-500" : ""
              }`}
              required
            />
            {hasSubmitted && errors.requiredDate && (
              <p className="text-xs text-danger-600">{errors.requiredDate[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Tombol submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-primary text-white text-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-700/25"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Mengajukan...
            </>
          ) : (
            "Ajukan Permintaan Penawaran"
          )}
        </button>
      </div>

      <p className="text-sm text-neutral-600 text-center mt-4">
        Harga ditetapkan oleh admin KWU setelah peninjauan. Anda akan menerima
        nomor referensi RFQ setelah pengajuan berhasil.
      </p>
    </form>
  );
}

