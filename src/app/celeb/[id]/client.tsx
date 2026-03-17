"use client";

import { PersonCard } from "@/components/person-card";
import type { Celeb } from "@/types";

export function CelebPageClient({ celeb }: { celeb: Celeb }) {
  return <PersonCard celeb={celeb} index={0} />;
}
