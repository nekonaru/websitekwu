"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface AuthShellProps {
  icon: LucideIcon;
  judul: string;
  deskripsi: string;
  children: React.ReactNode;
  pesan?: string | null;
  pesanTipe?: "error" | "success";
  bawah: React.ReactNode;
}

/** Kerangka tampilan bersama untuk halaman masuk dan pendaftaran. */
export function AuthShell({
  icon: Icon,
  judul,
  deskripsi,
  children,
  pesan,
  pesanTipe = "error",
  bawah,
}: AuthShellProps) {
  return (
    <section className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-9">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mb-1.5 text-2xl font-bold text-heading">{judul}</h1>
          <p className="text-sm text-muted">{deskripsi}</p>
        </div>

        {pesan && (
          <div
            role="alert"
            className={`mb-6 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
              pesanTipe === "success"
                ? "border-success-100 bg-success-50 text-success-800"
                : "border-danger-100 bg-danger-50 text-danger-800"
            }`}
          >
            {pesan}
          </div>
        )}

        {children}

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted">
          {bawah}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Dengan masuk, Anda menyetujui{" "}
        <Link
          href="/kebijakan-privasi"
          className="font-medium text-primary transition-colors duration-200 hover:underline"
        >
          Kebijakan Privasi
        </Link>{" "}
        KWU.
      </p>
    </section>
  );
}
