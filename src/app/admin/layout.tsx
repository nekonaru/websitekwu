"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, ShoppingCart, LogOut } from "lucide-react";

const MENU = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/rfqs", label: "RFQ & Quotation", icon: ClipboardList },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingCart },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface-muted">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[15rem_1fr] lg:px-8 lg:py-8">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Menu admin"
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Panel Admin
              </p>
              <p className="text-sm font-bold text-heading">KWU</p>
            </div>
            <ul className="space-y-1 p-2">
              {MENU.map((item) => {
                const aktif =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={aktif ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                        aktif
                          ? "bg-primary-soft text-primary"
                          : "text-body hover:bg-primary-soft hover:text-primary"
                      }`}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-border p-2">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-body transition-colors duration-200 hover:bg-danger-50 hover:text-danger-600"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Keluar Panel
              </Link>
            </div>
          </nav>
        </aside>

        {/* Konten utama */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
