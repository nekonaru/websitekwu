"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { RfqForm } from "@/components/business/rfq-form";
import type { CreateRfqInput } from "@/types/rfq";

export function RfqNewForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (data: CreateRfqInput) => {
    const res = await fetch("/api/rfqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationName: data.organizationName,
        contactName: data.contactName,
        businessEmail: data.businessEmail,
        deliveryLocation: data.deliveryLocation,
        requiredDate: data.requiredDate,
        items: data.items.map((item) => ({
          productName: item.productName,
          productDetails: item.productDetails,
          quantity: item.quantity,
          unit: item.unit,
        })),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Gagal mengajukan RFQ");
    }

    const result = await res.json();
    setSubmitted(true);
    // Alihkan ke halaman konfirmasi dengan nomor RFQ
    if (result.data?.rfqNumber) {
      router.push(`/business/rfq/confirmation/${result.data.rfqNumber}`);
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
          Layanan Bisnis
        </span>
        <h1 className="text-2xl font-bold text-heading md:text-3xl">
          Permintaan Penawaran Grosir
        </h1>
        <p className="mt-2 text-muted">
          Sampaikan kebutuhan pengadaan Anda. Tim KWU akan meninjau permintaan
          sebelum memberikan penawaran.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-8">
        {!submitted ? (
          <RfqForm onSubmit={handleSubmit} loading={false} />
        ) : null}
      </div>
    </section>
  );
}
