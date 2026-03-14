"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Image from "next/image";
import { api } from "@/lib/api";
import type { Celeb } from "@/types";

const SALUTE_BAR_COLORS = [
  "bg-emerald-400",
  "bg-cyan-400",
  "bg-violet-400",
  "bg-amber-400",
  "bg-lime-400",
];

const HATE_BAR_COLORS = [
  "bg-rose-400",
  "bg-orange-400",
  "bg-fuchsia-400",
  "bg-red-300",
  "bg-pink-400",
];

const RANK_EMOJIS_SALUTE = ["🥇", "🥈", "🥉", "4", "5"];
const RANK_EMOJIS_HATE = ["💀", "☠️", "👹", "4", "5"];

type Tab = "salute" | "hate";

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

export function TrendingChart() {
  const [allCelebs, setAllCelebs] = useState<Celeb[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("salute");

  useEffect(() => {
    api("/api/celebs")
      .then((r) => r.json())
      .then((data: Celeb[]) => {
        setAllCelebs(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaluteUpdate = useCallback((e: Event) => {
    const { celebId, respectors } = (e as CustomEvent).detail as {
      celebId: string;
      respectors: number;
    };
    setAllCelebs((prev) =>
      prev.map((c) => (c._id === celebId ? { ...c, respectors } : c)),
    );
    setFlashId(celebId);
    setTimeout(() => setFlashId(null), 600);
  }, []);

  const handleDispiteUpdate = useCallback((e: Event) => {
    const { celebId, dispiters } = (e as CustomEvent).detail as {
      celebId: string;
      dispiters: number;
    };
    setAllCelebs((prev) =>
      prev.map((c) => (c._id === celebId ? { ...c, dispiters } : c)),
    );
    setFlashId(celebId);
    setTimeout(() => setFlashId(null), 600);
  }, []);

  useEffect(() => {
    window.addEventListener("salute-update", handleSaluteUpdate);
    window.addEventListener("dispite-update", handleDispiteUpdate);
    return () => {
      window.removeEventListener("salute-update", handleSaluteUpdate);
      window.removeEventListener("dispite-update", handleDispiteUpdate);
    };
  }, [handleSaluteUpdate, handleDispiteUpdate]);

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

  if (allCelebs.length === 0) return null;

  const topSaluted = [...allCelebs]
    .sort((a, b) => b.respectors - a.respectors)
    .slice(0, 5);
  const topHated = [...allCelebs]
    .sort((a, b) => b.dispiters - a.dispiters)
    .slice(0, 5);

  const isSalute = activeTab === "salute";
  const topList = isSalute ? topSaluted : topHated;
  const maxCount = isSalute
    ? topSaluted[0]?.respectors || 1
    : topHated[0]?.dispiters || 1;
  const leader = topList[0];
  const barColors = isSalute ? SALUTE_BAR_COLORS : HATE_BAR_COLORS;
  const rankEmojis = isSalute ? RANK_EMOJIS_SALUTE : RANK_EMOJIS_HATE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      whileHover={{ rotate: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 18 }}
      className="relative overflow-hidden rounded-2xl border-3 border-black bg-white px-4 py-5 shadow-[5px_5px_0px_#000] sm:border-4 sm:px-6 sm:py-7 sm:shadow-[8px_8px_0px_#000]"
    >
      {/* Zigzag top */}
      <div
        className={`absolute top-0 right-0 left-0 h-1.5 ${isSalute ? "bg-emerald-400" : "bg-rose-400"}`}
        style={{
          clipPath:
            "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)",
        }}
      />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-2xl">
            {isSalute ? "📈" : "📉"}
          </span>
          <h2 className="text-sm font-black uppercase tracking-tight sm:text-xl">
            Trending Now
          </h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-2.5 py-1 shadow-[2px_2px_0px_#000] sm:px-3">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isSalute ? "bg-emerald-400" : "bg-rose-400"}`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${isSalute ? "bg-emerald-500" : "bg-rose-500"}`}
            />
          </span>
          <span className="text-[8px] font-black uppercase sm:text-[10px]">
            Live
          </span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="mb-5 flex gap-2 sm:mb-6 sm:gap-3">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("salute")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-3 border-black px-3 py-2.5 text-xs font-black uppercase sm:gap-2 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm ${
            isSalute
              ? "bg-emerald-400 shadow-[4px_4px_0px_#000]"
              : "bg-gray-100 shadow-[2px_2px_0px_#000]"
          }`}
        >
          <span className="text-base sm:text-lg">🫡</span>
          Salute Meter
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab("hate")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border-3 border-black px-3 py-2.5 text-xs font-black uppercase sm:gap-2 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm ${
            !isSalute
              ? "bg-rose-400 text-white shadow-[4px_4px_0px_#000]"
              : "bg-gray-100 shadow-[2px_2px_0px_#000]"
          }`}
        >
          <span className="text-base sm:text-lg">😤</span>
          Hate Meter
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: isSalute ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSalute ? 20 : -20 }}
          transition={{ duration: 0.25 }}
        >
          {/* #1 Spotlight */}
          <AnimatePresence mode="wait">
            <motion.div
              key={leader._id + activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`relative mb-5 flex items-center gap-3 rounded-2xl border-3 border-black px-4 py-4 shadow-[5px_5px_0px_#000] sm:mb-7 sm:gap-5 sm:rounded-2xl sm:border-4 sm:px-6 sm:py-5 sm:shadow-[7px_7px_0px_#000] ${
                isSalute ? "bg-amber-300" : "bg-rose-300"
              }`}
            >
              {/* Corner emoji */}
              <span className="absolute -top-2.5 -right-2.5 text-base sm:-top-3 sm:-right-3 sm:text-xl">
                {isSalute ? "⭐" : "🔥"}
              </span>

              {/* Crown / Skull + Image */}
              <div className="relative shrink-0">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 1.5 }}
                  className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 text-lg sm:-top-5 sm:text-2xl"
                >
                  {isSalute ? "👑" : "💀"}
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
                <p className="text-[9px] font-bold uppercase text-black/50 sm:text-xs">
                  {isSalute ? "Most Saluted" : "Most Hated"}
                </p>
                <h3 className="truncate text-base font-black uppercase sm:text-2xl">
                  {leader.name}
                </h3>
                <span className="inline-block rounded-md border-2 border-black bg-white/70 px-1.5 py-0.5 text-[8px] font-bold uppercase sm:px-2 sm:text-[10px]">
                  {leader.category?.name}
                </span>
              </div>

              {/* Count */}
              <motion.div
                whileHover={{ scale: 1.08, rotate: -3 }}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl border-3 border-black px-3 py-2 font-black shadow-[3px_3px_0px_#000] sm:rounded-2xl sm:border-4 sm:px-5 sm:py-3 sm:shadow-[4px_4px_0px_#000] ${
                  isSalute ? "bg-emerald-400" : "bg-rose-500 text-white"
                }`}
              >
                <span className="text-xl sm:text-3xl">
                  {isSalute ? "🫡" : "😤"}
                </span>
                <motion.span
                  key={
                    isSalute
                      ? leader.respectors
                      : leader.dispiters + "-h"
                  }
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="text-sm tabular-nums sm:text-xl"
                >
                  {formatCount(
                    isSalute ? leader.respectors : leader.dispiters,
                  )}
                </motion.span>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Bar Chart */}
          <LayoutGroup id={activeTab}>
            <div className="flex flex-col gap-2.5 sm:gap-3">
              {topList.map((celeb, i) => {
                const value = isSalute
                  ? celeb.respectors
                  : celeb.dispiters;
                const pct = Math.max((value / maxCount) * 100, 10);
                const isFlashing = flashId === celeb._id;
                const isTopThree = i < 3;
                return (
                  <motion.div
                    key={celeb._id}
                    layout
                    whileHover={{ x: 4 }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      },
                    }}
                    className={`flex items-center gap-2 sm:gap-3 ${
                      isFlashing ? "animate-card-shake" : ""
                    }`}
                  >
                    {/* Rank — emoji medals for top 3 */}
                    <motion.div
                      layout
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-black text-sm font-black shadow-[2px_2px_0px_#000] sm:h-9 sm:w-9 sm:rounded-xl sm:text-base ${
                        isTopThree
                          ? isSalute
                            ? "bg-amber-300"
                            : "bg-rose-300"
                          : "bg-gray-200"
                      }`}
                    >
                      {isTopThree ? (
                        rankEmojis[i]
                      ) : (
                        <span className="text-[10px] sm:text-xs">
                          #{i + 1}
                        </span>
                      )}
                    </motion.div>

                    {/* Avatar */}
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-black shadow-[2px_2px_0px_#000] sm:h-10 sm:w-10 sm:border-3">
                      <Image
                        src={celeb.image}
                        alt={celeb.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Name (sm+) */}
                    <span className="hidden w-24 truncate text-xs font-black uppercase sm:block sm:w-32">
                      {celeb.name}
                    </span>

                    {/* Striped bar */}
                    <div className="relative h-8 flex-1 overflow-hidden rounded-xl border-2 border-black bg-gray-100 shadow-[2px_2px_0px_#000] sm:h-10 sm:rounded-2xl sm:border-3">
                      <motion.div
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`absolute inset-y-0 left-0 funky-bar ${barColors[i]}`}
                      />
                      {/* Name on bar (mobile) */}
                      <span className="absolute inset-y-0 left-2.5 z-10 flex items-center text-[9px] font-black uppercase sm:hidden">
                        {celeb.name}
                      </span>
                      {/* Emoji at end of bar */}
                      <motion.span
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute inset-y-0 left-0 flex items-center justify-end pr-1 text-xs sm:pr-2 sm:text-sm"
                      >
                        {isSalute ? "🫡" : "😤"}
                      </motion.span>
                    </div>

                    {/* Count */}
                    <motion.span
                      key={value}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                      className="w-11 text-right text-[10px] font-black tabular-nums sm:w-16 sm:text-sm"
                    >
                      {formatCount(value)}
                    </motion.span>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </motion.div>
      </AnimatePresence>

      {/* Zigzag bottom */}
      <div
        className={`absolute right-0 bottom-0 left-0 h-1.5 ${isSalute ? "bg-violet-400" : "bg-orange-400"}`}
        style={{
          clipPath:
            "polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)",
        }}
      />
    </motion.div>
  );
}
