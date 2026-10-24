import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { KwuChatbot } from "@/components/chat/kwu-chatbot";
import { BackToTop } from "@/components/ui/back-to-top";
import { CartProvider } from "@/contexts/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://websitekwu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "KWU - Toko Kampus",
    template: "%s | KWU",
  },
  description:
    "Toko kampus resmi dengan katalog produk, pemesanan B2C, dan layanan penawaran grosir (RFQ) B2B.",
  applicationName: "KWU",
  keywords: [
    "toko kampus",
    "kwu",
    "alat tulis",
    "kebutuhan kampus",
    "pemesanan online",
    "penawaran grosir",
    "RFQ",
  ],
  authors: [{ name: "KWU" }],
  creator: "KWU",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "KWU",
    title: "KWU - Toko Kampus",
    description:
      "Katalog produk, pemesanan B2C, dan layanan penawaran grosir (RFQ).",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "KWU - Toko Kampus",
    description:
      "Katalog produk, pemesanan B2C, dan layanan penawaran grosir (RFQ).",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#konten-utama" className="skip-link">
          Lewati ke konten utama
        </a>
        <CartProvider>
          <Header />
          <main id="konten-utama" className="flex-1 focus:outline-none">
            {children}
          </main>
          <KwuChatbot />
          <BackToTop />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
