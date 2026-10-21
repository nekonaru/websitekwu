"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ArrowRight } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { formatRupiah } from "@/lib/format";

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
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading mb-2">Profil Saya</h1>
        <p className="text-muted">Kelola akun dan riwayat pesanan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informasi akun */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="flex flex-col items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl mb-3 overflow-hidden">
                {(user.user_metadata?.full_name || user.email || "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <h2 className="font-bold text-heading">{user.user_metadata?.full_name || "Pengguna"}</h2>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>

        {/* Riwayat pesanan */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-heading mb-4">Riwayat Pesanan</h2>
          <div className="bg-white border border-border rounded-xl p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted">Belum ada pesanan.</p>
                <Link
                  href="/katalog"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
                >
                  Belanja Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50">
                    <th className="px-6 py-3 text-sm font-semibold text-muted">Nomor Pesanan</th>
                    <th className="px-6 py-3 text-sm font-semibold text-muted text-right">Total</th>
                    <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Tanggal</th>
                    <th className="px-6 py-3 text-sm font-semibold text-muted text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-4 text-sm font-medium text-heading">
                        {o.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary text-right">
                        {formatRupiah(o.total)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted text-center">
                        {new Date(o.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            o.status === "delivered"
                              ? "bg-green-50 text-green-600"
                              : o.status === "processing" || o.status === "paid"
                                ? "bg-blue-50 text-blue-600"
                                : o.status === "pending"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-neutral-50 text-neutral-600"
                          }`}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
