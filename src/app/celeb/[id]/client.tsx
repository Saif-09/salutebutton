"use client";

import { PersonCard } from "@/components/person-card";
import type { Celeb } from "@/types";

export function CelebPageClient({ celeb, size }: { celeb: Celeb; size?: "default" | "large" }) {
  return <PersonCard celeb={celeb} index={0} size={size} />;
}
