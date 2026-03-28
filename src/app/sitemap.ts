import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://good-hospital.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hospitals = await prisma.hospital.findMany({
    select: { id: true, updatedAt: true },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const hospitalEntries: MetadataRoute.Sitemap = hospitals.map((h) => ({
    url: `${SITE_URL}/hospital/${h.id}`,
    lastModified: h.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/recommend`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...hospitalEntries,
    ...categoryEntries,
  ];
}
