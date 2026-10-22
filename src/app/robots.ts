import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://websitekwu.vercel.app"
);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Halaman yang butuh sesi tidak perlu diindeks.
        disallow: ["/admin", "/profil", "/checkout", "/pesanan-saya", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
