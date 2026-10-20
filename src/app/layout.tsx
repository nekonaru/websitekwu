import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { KwuChatbot } from "@/components/chat/kwu-chatbot";
import { CartProvider } from "@/contexts/cart-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KWU - Toko Kampus",
  description: "Toko kampus resmi dengan katalog produk, pesanan B2C, dan layanan penawaran grosir (RFQ) B2B.",
  openGraph: {
    siteName: "KWU",
    title: "KWU - Toko Kampus",
    description: "Katalog produk, pemesanan B2C, dan layanan penawaran grosir (RFQ).",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <KwuChatbot />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

