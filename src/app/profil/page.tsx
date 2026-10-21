"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/types/rfq";

interface ProfileUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
    address?: string;
  };
}

interface ProfileOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
}

const WAKTU_STATUS: Record<string, string> = {
  pending: "bg-warning-50 text-warning-800",
  paid: "bg-info-50 text-info-800",
  processing: "bg-info-50 text-info-800",
  shipped: "bg-orange-50 text-orange-700",
  delivered: "bg-success-50 text-success-800",
  cancelled: "bg-danger-50 text-danger-700",
  refunded: "bg-neutral-100 text-neutral-700",
};

export default function Profil() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let aktif = true;

    async function loadProfile() {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        if (!aktif) return;

        setUser({
          id: authUser.id,
          email: authUser.email ?? "",
          user_metadata: (authUser.user_metadata ??
            {}) as ProfileUser["user_metadata"],
        });

        // Ambil pesanan
        const res = await fetch("/api/my/orders");
        const data = await res.json();
        if (!aktif) return;
        if (data.success) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      aktif = false;
    };
  }, [router]);

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Memuat profil...</div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-border rounded-2xl p-8 md:p-10 shadow-lg text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 mb-4">
            <User className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-heading mb-2">Anda belum masuk</h2>
          <p className="text-muted mb-6">Silakan masuk untuk mengakses profil.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
          >
            Masuk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading md:text-3xl">
          Profil Saya
        </h1>
        <p className="mt-1 text-muted">
          Kelola akun dan riwayat pesanan Anda.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr] lg:gap-8">
        {/* Informasi akun */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <div className="mb-6 flex flex-col items-center text-center">
              <span
                className="mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-2xl font-extrabold text-primary"
                aria-hidden="true"
              >
                {(user.user_metadata?.full_name || user.email || "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
              <h2 className="font-bold text-heading">
                {user.user_metadata?.full_name || "Pengguna"}
              </h2>
              <p className="mt-0.5 break-all text-sm text-muted">
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-danger-200 py-3 text-sm font-semibold text-danger-600 transition-colors duration-200 hover:bg-danger-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Keluar dari
              Akun
            </button>
          </div>
        </aside>

        {/* Riwayat pesanan */}
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-heading">Riwayat Pesanan</h2>
            <Link
              href="/pesanan-saya"
              className="text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-white shadow-soft">
            {orders.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ShoppingBag
                  className="mx-auto mb-4 h-10 w-10 text-muted"
                  aria-hidden="true"
                />
                <p className="mb-1 font-bold text-heading">Belum ada pesanan</p>
                <p className="mb-6 text-sm text-muted">
                  Pesanan yang Anda buat akan tampil di sini.
                </p>
                <Link
                  href="/katalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
                >
                  Belanja Sekarang
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors duration-200 hover:bg-surface-muted sm:p-5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-heading">
                        {o.order_number}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatDate(o.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${WAKTU_STATUS[o.status] ?? "bg-neutral-100 text-neutral-700"}`}
                      >
                        {ORDER_STATUS_LABELS[o.status as OrderStatus] ??
                          o.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {formatRupiah(o.total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
