"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Celeb, Category } from "@/types";
import { ROW_COLORS } from "@/lib/theme";

function getRowColor(index: number) {
  return ROW_COLORS[index % ROW_COLORS.length];
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

export default function LeaderboardPage() {
  const [celebs, setCelebs] = useState<Celeb[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/api/celebs").then((r) => r.json()),
      api("/api/categories").then((r) => r.json()),
    ])
      .then(([celebData, catData]: [Celeb[], Category[]]) => {
        setCelebs(celebData.sort((a, b) => b.respectors - a.respectors));
        setCategories(catData);
        if (catData.length > 0) setSelectedCategory(catData[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!selectedCategory) return celebs;
    return celebs.filter((c) => c.category?._id === selectedCategory);
  }, [celebs, selectedCategory]);

  // Index of the selected category for alternating tilt
  const selectedIndex = useMemo(() => {
    if (!selectedCategory) return categories.length; // "All" is last
    return categories.findIndex((c) => c._id === selectedCategory);
  }, [selectedCategory, categories]);

  // Alternating tilt: even index = positive, odd = negative
  const filterTilt = selectedIndex % 2 === 0 ? 2 : -2;

  return (
    <div className="min-h-screen">
      {/* Combined header */}
      <div className="sticky top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-xl border-3 border-black bg-negative px-3 py-1.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] sm:px-5 sm:py-2 sm:text-sm sm:shadow-[3px_3px_0px_#000]"
            >
              ← Back
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring" as const, stiffness: 200 }}
            className="rounded-full border-3 border-black bg-accent px-4 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000] sm:px-6 sm:py-2 sm:text-sm sm:shadow-[3px_3px_0px_#000]"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              className="mr-1 inline-block"
            >
              🔥
            </motion.span>
            Hall of Legends
          </motion.div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-2 pb-8 sm:px-4 sm:pb-12">
        {/* Leaderboard title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring" as const, stiffness: 200 }}
          className="mb-5 flex flex-col items-center pt-3 sm:mb-8 sm:pt-4"
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 2 }}
            className="text-4xl sm:text-6xl"
          >
            🏆
          </motion.span>
          <h1 className="mt-1 text-center text-3xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-primary">Leader</span>board
          </h1>
        </motion.div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0, rotate: filterTilt }}
          transition={{ delay: 0.35, type: "spring" as const, stiffness: 200, damping: 15 }}
          className="hide-scrollbar mb-8 flex flex-wrap items-center justify-center gap-1.5 sm:mb-12 sm:gap-3"
        >
          {categories.map((cat, i) => (
            <motion.button
              key={cat._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.04 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat._id)}
              className={cn(
                "rounded-lg border-2 border-black px-3 py-1.5 text-[10px] font-bold uppercase sm:rounded-xl sm:border-3 sm:px-6 sm:py-2 sm:text-sm",
                selectedCategory === cat._id
                  ? "bg-selected text-white shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]"
                  : "bg-white text-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]",
              )}
            >
              {cat.name}
            </motion.button>
          ))}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + categories.length * 0.04 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "rounded-lg border-2 border-black px-3 py-1.5 text-[10px] font-bold uppercase sm:rounded-xl sm:border-3 sm:px-6 sm:py-2 sm:text-sm",
              !selectedCategory
                ? "bg-secondary text-white shadow-[2px_2px_0px_var(--color-secondary-light)] sm:shadow-[3px_3px_0px_var(--color-secondary-light)]"
                : "bg-white text-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]",
            )}
          >
            🏆 All
          </motion.button>
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="h-10 w-10 rounded-full border-4 border-black border-t-transparent"
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory ?? "all"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 sm:gap-6"
            >
              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-5xl">🤷</p>
                  <p className="mt-3 text-lg font-black uppercase">
                    No one here yet!
                  </p>
                  <p className="text-sm text-gray-500">
                    Be the first to salute someone in this category.
                  </p>
                </div>
              ) : (
                filtered.map((celeb, index) => (
                  <motion.div
                    key={celeb._id}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.03,
                      type: "spring" as const,
                      stiffness: 200,
                      damping: 20,
                    }}
                    whileHover={{ x: 6, scale: 1.01 }}
                    className={`flex items-center gap-2 rounded-xl border-3 border-black px-4 py-4 shadow-[3px_3px_0px_#000] transition-shadow hover:shadow-[8px_8px_0px_#000] sm:gap-4 sm:rounded-2xl sm:border-4 sm:px-8 sm:py-6 sm:shadow-[6px_6px_0px_#000] ${getRowColor(index)}`}
                  >
                    {/* Rank badge */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-black text-white sm:h-12 sm:w-12 sm:text-lg">
                      #{index + 1}
                    </div>

                    {/* Image */}
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-black shadow-[2px_2px_0px_#000] sm:h-16 sm:w-16 sm:border-3 sm:shadow-[3px_3px_0px_#000]">
                      <Image
                        src={celeb.image}
                        alt={celeb.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs font-black uppercase sm:text-xl">
                        {celeb.name}
                      </h3>
                      <span className="inline-block rounded-md border border-black bg-white/60 px-1.5 py-0.5 text-[9px] font-bold uppercase sm:border-2 sm:px-2 sm:text-[10px]">
                        {celeb.category?.name}
                      </span>
                    </div>

                    {/* Score pills */}
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-0.5 rounded-lg border-2 border-black bg-positive px-2 py-1 font-black shadow-[2px_2px_0px_#000] sm:gap-1 sm:rounded-xl sm:border-3 sm:px-4 sm:py-2 sm:shadow-[3px_3px_0px_#000]"
                      >
                        <span className="text-sm sm:text-lg">🫡</span>
                        <span className="text-xs tabular-nums sm:text-base">
                          {formatCount(celeb.respectors)}
                        </span>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-0.5 rounded-lg border-2 border-black bg-primary px-2 py-1 font-black text-white shadow-[2px_2px_0px_#000] sm:gap-1 sm:rounded-xl sm:border-3 sm:px-4 sm:py-2 sm:shadow-[3px_3px_0px_#000]"
                      >
                        <span className="text-sm sm:text-lg">😤</span>
                        <span className="text-xs tabular-nums sm:text-base">
                          {formatCount(celeb.dispiters)}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
