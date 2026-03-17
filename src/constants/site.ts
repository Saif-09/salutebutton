import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: "SaluteButton",
  description:
    "Smash that button and salute the greatest celebrities and historical figures. Discover, rank, and show your respect to the greats.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/logo.png",
};

export const SALUTE_EMOJIS = ["🫡", "🎖️", "⭐", "🏅", "👏", "🙌"];
