/**
 * Centralized theme configuration for SaluteButton.
 *
 * CSS custom properties are registered in globals.css via Tailwind's @theme
 * directive, so every color here is available as a utility class (e.g.
 * bg-primary, text-secondary, border-accent).
 *
 * Import this file when you need the raw hex values in JavaScript — for
 * example in chart color arrays or inline styles.
 */

export const colors = {
  /* ---- brand ---- */
  primary: "#F43F5E",        // rose-red
  primaryLight: "#FFE4E9",   // light rose
  primaryDark: "#D6293E",    // deep rose

  secondary: "#1E3A5F",      // dark navy
  secondaryLight: "#2D6A9F",  // steel blue
  secondaryMuted: "#EDF2F7", // light slate

  accent: "#FFDA78",         // warm yellow
  accentLight: "#FFF8E1",    // cream yellow

  /* ---- semantic ---- */
  positive: "#34D399",       // emerald (salute)
  positiveDark: "#059669",   // dark emerald
  negative: "#FF7F3E",       // vibrant orange (disrespect)
  negativeDark: "#E05A1A",   // deep orange

  /* ---- surfaces ---- */
  surface: "#FFFFFF",
  surfaceAlt: "#FFF8E1",     // warm cream (page background)
  muted: "#FFF5D6",          // light gold

  /* ---- selection / misc ---- */
  selected: "#1E3A5F",       // dark navy (category filters)
  shadow: "#1E3A5F",         // shadow accent
} as const;

/** Leaderboard / group-page row cycling colors. */
export const ROW_COLORS = [
  "bg-rose-200",
  "bg-amber-100",
  "bg-red-100",
  "bg-yellow-100",
  "bg-rose-100",
  "bg-slate-100",
  "bg-orange-50",
  "bg-amber-50",
] as const;

/** Trending-chart bar colours (decorative, per-rank). */
export const SALUTE_BAR_COLORS = [
  "bg-emerald-400",
  "bg-teal-400",
  "bg-green-400",
  "bg-cyan-400",
  "bg-lime-400",
] as const;

export const HATE_BAR_COLORS = [
  "bg-orange-400",
  "bg-amber-400",
  "bg-red-300",
  "bg-rose-400",
  "bg-yellow-400",
] as const;
