"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/format";
import { FormField } from "@/components/ui/form-field";
import { AuthShell } from "@/components/ui/auth-shell";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
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

      router.push("/login?registered=1");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Gagal mendaftar. Coba lagi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon={UserPlus}
      judul="Daftar Akun Baru"
      deskripsi="Bergabunglah dengan KWU untuk mulai berbelanja."
      pesan={error}
      bawah={
        <>
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary transition-colors duration-200 hover:text-primary-hover hover:underline"
          >
            Masuk di sini
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          label="Nama Lengkap"
          value={name}
          onChange={setName}
          icon={User}
          required
          autoComplete="name"
          placeholder="Nama sesuai identitas"
        />

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
          minLength={8}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
        />

        <FormField
          label="Konfirmasi Kata Sandi"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          icon={Lock}
          required
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          error={
            confirmPassword && confirmPassword !== password
              ? "Konfirmasi kata sandi belum sama."
              : undefined
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Mendaftarkan...
            </>
          ) : (
            "Daftar"
          )}
        </button>

        <p className="flex items-start justify-center gap-1.5 text-center text-xs text-muted">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Gunakan alamat surel yang aktif agar verifikasi akun berhasil.
        </p>
      </form>
    </AuthShell>
  );
}
