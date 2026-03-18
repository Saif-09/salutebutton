import type { MetadataRoute } from "next";
import { siteConfig } from "@/constants/site";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Fetch all celebs for dynamic routes
  let celebPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/celebs`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const celebs = await res.json();
      celebPages = celebs.map((celeb: { _id: string; updatedAt?: string }) => ({
        url: `${siteConfig.url}/celeb/${celeb._id}`,
        lastModified: celeb.updatedAt ? new Date(celeb.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Sitemap will still work with static pages if API is unavailable
  }

  return [...staticPages, ...celebPages];
}
