"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Image from "next/image";
import { api } from "@/lib/api";
import type { Celeb } from "@/types";

const BAR_COLORS = [
  "bg-emerald-400",
  "bg-blue-400",
  "bg-purple-400",
  "bg-orange-400",
  "bg-pink-400",
];

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

export function TrendingChart() {
  const [allCelebs, setAllCelebs] = useState<Celeb[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashId, setFlashId] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    api("/api/celebs")
      .then((r) => r.json())
      .then((data: Celeb[]) => {
        setAllCelebs(data.sort((a, b) => b.respectors - a.respectors));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Listen for real-time salute updates
  const handleSaluteUpdate = useCallback(
    (e: Event) => {
      const { celebId, respectors } = (e as CustomEvent).detail as {
        celebId: string;
        respectors: number;
      };

      setAllCelebs((prev) => {
        const updated = prev.map((c) =>
          c._id === celebId ? { ...c, respectors } : c,
        );
        return updated.sort((a, b) => b.respectors - a.respectors);
      });

      // Flash highlight on the updated celeb
      setFlashId(celebId);
      setTimeout(() => setFlashId(null), 600);
    },
    [],
  );

  useEffect(() => {
    window.addEventListener("salute-update", handleSaluteUpdate);
    return () =>
      window.removeEventListener("salute-update", handleSaluteUpdate);
  }, [handleSaluteUpdate]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="h-8 w-8 rounded-full border-4 border-black border-t-transparent"
        />
      </div>
    );
  }

  const topCelebs = allCelebs.slice(0, 5);
  if (topCelebs.length === 0) return null;

  const maxCount = topCelebs[0]?.respectors || 1;
  const leader = topCelebs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 18 }}
      className="rounded-2xl border-3 border-black bg-white px-4 py-5 shadow-[5px_5px_0px_#000] sm:border-4 sm:px-6 sm:py-7 sm:shadow-[8px_8px_0px_#000]"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
            className="text-lg sm:text-2xl"
          >
            📈
          </motion.span>
          <h2 className="text-sm font-black uppercase tracking-tight sm:text-xl">
            Trending Now
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 sm:h-3 sm:w-3" />
          </span>
          <span className="text-[9px] font-bold uppercase text-gray-500 sm:text-xs">
            Live
          </span>
        </div>
      </div>

      {/* #1 Spotlight */}
      <AnimatePresence mode="wait">
        <motion.div
          key={leader._id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-5 flex items-center gap-3 rounded-xl border-3 border-black bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-4 py-3 shadow-[4px_4px_0px_#000] sm:mb-7 sm:gap-5 sm:rounded-2xl sm:px-6 sm:py-5 sm:shadow-[6px_6px_0px_#000]"
        >
          {/* Crown + Image */}
          <div className="relative shrink-0">
            <motion.span
              animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 text-lg sm:-top-5 sm:text-2xl"
            >
              👑
            </motion.span>
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-3 border-black shadow-[3px_3px_0px_#000] sm:h-20 sm:w-20 sm:border-4 sm:shadow-[4px_4px_0px_#000]">
              <Image
                src={leader.image}
                alt={leader.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase text-black/60 sm:text-xs">
              Most Saluted
            </p>
            <h3 className="truncate text-base font-black uppercase sm:text-2xl">
              {leader.name}
            </h3>
            <span className="inline-block rounded-md border border-black bg-white/70 px-1.5 py-0.5 text-[8px] font-bold uppercase sm:border-2 sm:px-2 sm:text-[10px]">
              {leader.category?.name}
            </span>
          </div>

          {/* Count */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: -3 }}
            className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border-3 border-black bg-emerald-400 px-3 py-2 font-black shadow-[3px_3px_0px_#000] sm:rounded-2xl sm:px-5 sm:py-3 sm:shadow-[4px_4px_0px_#000]"
          >
            <span className="text-xl sm:text-3xl">🫡</span>
            <motion.span
              key={leader.respectors}
              initial={{ scale: 1.4, color: "#16a34a" }}
              animate={{ scale: 1, color: "#000000" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-sm tabular-nums sm:text-xl"
            >
              {formatCount(leader.respectors)}
            </motion.span>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Bar Chart */}
      <LayoutGroup>
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {topCelebs.map((celeb, i) => {
            const pct = Math.max((celeb.respectors / maxCount) * 100, 8);
            const isFlashing = flashId === celeb._id;
            return (
              <motion.div
                key={celeb._id}
                layout
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 25 },
                }}
                className="flex items-center gap-2 sm:gap-3"
              >
                {/* Rank */}
                <motion.div
                  layout
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-black text-white sm:h-8 sm:w-8 sm:text-xs"
                >
                  #{i + 1}
                </motion.div>

                {/* Avatar */}
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-black sm:h-9 sm:w-9">
                  <Image
                    src={celeb.image}
                    alt={celeb.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Name (hidden on small, visible on sm+) */}
                <span className="hidden w-24 truncate text-xs font-bold uppercase sm:block sm:w-32">
                  {celeb.name}
                </span>

                {/* Bar */}
                <div
                  className={`relative h-7 flex-1 overflow-hidden rounded-lg border-2 border-black bg-gray-100 transition-shadow duration-300 sm:h-9 sm:rounded-xl sm:border-3 ${
                    isFlashing ? "shadow-[0_0_12px_rgba(16,185,129,0.6)]" : ""
                  }`}
                >
                  <motion.div
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`absolute inset-y-0 left-0 ${BAR_COLORS[i]}`}
                  />
                  {/* Name on the bar (visible on small screens) */}
                  <span className="absolute inset-y-0 left-2 flex items-center text-[9px] font-bold uppercase sm:hidden">
                    {celeb.name}
                  </span>
                </div>

                {/* Count */}
                <motion.span
                  key={celeb.respectors}
                  initial={{ scale: 1.3, color: "#16a34a" }}
                  animate={{ scale: 1, color: "#000000" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-10 text-right text-[10px] font-black tabular-nums sm:w-14 sm:text-sm"
                >
                  {formatCount(celeb.respectors)}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </motion.div>
  );
}
