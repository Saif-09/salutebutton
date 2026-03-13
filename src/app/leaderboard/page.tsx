"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Celeb, Category } from "@/types";

const ROW_COLORS = [
  "bg-amber-400",
  "bg-amber-300",
  "bg-gray-200",
  "bg-orange-300",
  "bg-orange-200",
  "bg-amber-100",
  "bg-gray-100",
  "bg-orange-100",
];

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

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-50 px-2 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-xl border-3 border-black bg-rose-400 px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] sm:px-5 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
            >
              ← Back
            </Link>
          </motion.div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-2 pb-8 sm:px-4 sm:pb-12">
        {/* The Elite Few pill */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" as const, stiffness: 200 }}
          className="mb-3 flex justify-center sm:mb-4"
        >
          <div className="rounded-full border-3 border-black bg-white px-4 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] sm:px-6 sm:py-2 sm:text-base sm:shadow-[4px_4px_0px_#000]">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              className="mr-1 inline-block"
            >
              🔥
            </motion.span>
            The Elite Few
          </div>
        </motion.div>

        {/* Big yellow tilted banner */}
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ rotate: -3, scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" as const, stiffness: 150, damping: 12 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          className="mb-5 cursor-default rounded-2xl border-3 border-black bg-amber-400 px-6 py-5 shadow-[5px_5px_0px_#000] sm:mb-8 sm:border-4 sm:px-16 sm:py-8 sm:shadow-[8px_8px_0px_#000]"
        >
          <h1 className="text-center text-2xl leading-tight font-black uppercase tracking-tight drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)] sm:text-6xl lg:text-7xl">
            Leaderboard
            <br />
            <span className="text-orange-600">Most Saluted</span>
          </h1>
        </motion.div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="hide-scrollbar mb-5 flex flex-wrap items-center justify-center gap-1.5 sm:mb-8 sm:gap-3"
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
                  ? "bg-blue-500 text-white shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]"
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
                ? "bg-black text-white shadow-[2px_2px_0px_#2563eb] sm:shadow-[3px_3px_0px_#2563eb]"
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
              className="flex flex-col gap-2.5 sm:gap-4"
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
                    className={`flex items-center gap-2 rounded-xl border-3 border-black px-2 py-2 shadow-[3px_3px_0px_#000] transition-shadow hover:shadow-[8px_8px_0px_#000] sm:gap-4 sm:rounded-2xl sm:border-4 sm:px-5 sm:py-4 sm:shadow-[6px_6px_0px_#000] ${getRowColor(index)}`}
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

                    {/* Score pill */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex shrink-0 items-center gap-0.5 rounded-lg border-2 border-black bg-emerald-400 px-2 py-1 font-black shadow-[2px_2px_0px_#000] sm:gap-1 sm:rounded-xl sm:border-3 sm:px-4 sm:py-2 sm:shadow-[3px_3px_0px_#000]"
                    >
                      <span className="text-sm sm:text-lg">🫡</span>
                      <span className="text-xs tabular-nums sm:text-base">
                        {formatCount(celeb.respectors)}
                      </span>
                    </motion.div>
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
