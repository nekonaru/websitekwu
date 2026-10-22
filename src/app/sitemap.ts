import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "https://websitekwu.vercel.app"
);

export default function sitemap(): MetadataRoute.Sitemap {
  const halamanStatis: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/katalog`, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${BASE_URL}/business/rfq/new`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${BASE_URL}/tentang`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/kontak`, changeFrequency: "yearly", priority: 0.5 },
    {
      url: `${BASE_URL}/kebijakan-privasi`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    { url: `${BASE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  return halamanStatis.map((halaman) => ({
    ...halaman,
    lastModified: new Date(),
  }));
}
