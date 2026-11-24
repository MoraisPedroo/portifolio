import type { MetadataRoute } from "next";

const SITE = "https://www.dpsystemsbrasil.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/projetos`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/contato`, changeFrequency: "yearly", priority: 0.7 },
  ];
}
