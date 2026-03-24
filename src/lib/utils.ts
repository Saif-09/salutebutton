import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format large numbers into compact human-readable strings.
 * 999 → "999", 1200 → "1.2K", 15000 → "15K", 1500000 → "1.5M", 2000000000 → "2B"
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000_000) {
    const val = Math.floor(n / 1_000_000) / 1_000; // truncate to 2 decimal places
    return `${val.toFixed(2).replace(/\.?0+$/, "")}B`;
  }
  if (n >= 1_000_000) {
    const val = Math.floor(n / 1_000) / 1_000; // truncate to 2 decimal places
    return `${val.toFixed(2).replace(/\.?0+$/, "")}M`;
  }
  if (n >= 1_000) {
    const val = Math.floor(n) / 1_000; // truncate to 2 decimal places
    return `${val.toFixed(2).replace(/\.?0+$/, "")}K`;
  }
  return n.toString();
}
