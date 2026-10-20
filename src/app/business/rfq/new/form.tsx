"use client";

import { useState } from "react";
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
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Permintaan Penawaran Grosir
        </h1>
        <p className="text-neutral-600 mt-1">
          Sampaikan kebutuhan pengadaan Anda. Tim KWU akan meninjau permintaan
          sebelum memberikan penawaran.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
        {!submitted ? (
          <RfqForm onSubmit={handleSubmit} loading={false} />
        ) : null}
      </div>
    </section>
  );
}
