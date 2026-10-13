import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "http://localhost:3000";
  return ["", "/passagens", "/destinos", "/horarios", "/pontos-de-venda", "/quem-somos", "/duvidas-frequentes", "/contato"].map(p => ({ url: base + p, lastModified: new Date() }));
}
