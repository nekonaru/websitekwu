"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/format";
import { FormField } from "@/components/ui/form-field";
import { AuthShell } from "@/components/ui/auth-shell";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSukses(null);
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl") || "/";
      const baruMasuk = params.get("registered") === "1";

      if (baruMasuk) {
        setSukses("Akun berhasil dibuat. Silakan masuk dengan data Anda.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal masuk. Periksa email dan kata sandi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon={LogIn}
      judul="Masuk ke Akun"
      deskripsi="Selamat datang kembali ke KWU."
      pesan={error ?? sukses}
      pesanTipe={error ? "error" : "success"}
      bawah={
        <>
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary transition-colors duration-200 hover:text-primary-hover hover:underline"
          >
            Daftar sekarang
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          icon={Mail}
          required
          autoComplete="email"
          placeholder="nama@contoh.com"
        />

        <FormField
          label="Kata Sandi"
          type="password"
          value={password}
          onChange={setPassword}
          icon={Lock}
          required
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Memproses...
            </>
          ) : (
            "Masuk"
          )}
        </button>

        {error && (
          <p className="flex items-start justify-center gap-1.5 text-center text-xs text-muted">
            <AlertCircle
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            Pastikan email dan kata sandi sudah benar.
          </p>
        )}

        {sukses && (
          <p className="flex items-start justify-center gap-1.5 text-center text-xs text-success-700">
            <CheckCircle2
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            />
            Masukkan kredensial Anda untuk melanjutkan.
          </p>
        )}
      </form>
    </AuthShell>
  );
}
