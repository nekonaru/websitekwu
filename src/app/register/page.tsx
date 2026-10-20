export default function Register() {
  return (
    <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-surface border border-border rounded-xl p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Daftar Akun</h1>
        <form className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="w-full pl-3 pr-4 py-2.5 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-orange-500 transition-colors"
          >
            Daftar
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-600">
          Sudah punya akun?{" "}
          <a href="/login" className="text-primary hover:underline">
            Masuk di sini
          </a>
        </p>
      </div>
    </section>
  );
}

