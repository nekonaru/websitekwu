"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const supabase = createBrowserSupabaseClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasi tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError) throw authError;

      setError("");
      router.push("/login?registered=1");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal mendaftar. Coba lagi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-border rounded-2xl p-8 md:p-10 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white mb-4">
            <User className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-heading mb-2">Daftar Akun Baru</h1>
          <p className="text-muted">Bergabunglah dengan KWU untuk memulai berbelanja.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nama Anda"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="nama@contoh.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                minLength={8}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted" aria-hidden="true" />
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl text-heading focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-lg hover:bg-orange-500 transition-all shadow-md shadow-orange-200 disabled:opacity-60"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Masuk di sini
          </Link>
        </p>
      </div>
    </section>
  );
}
