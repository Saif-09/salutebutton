"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const MARQUEE_EMOJIS = [
  "🫡", "🔥", "⭐", "😤", "💪", "🎯", "👍", "💥", "😎", "🤜",
  "💜", "🏆", "👑", "✨", "🎉", "👏", "🙌", "💀", "☠️", "🎖️",
];

const stickers = [
  { text: "SALUTE", emoji: "🫡", bg: "bg-positive", rotate: "-rotate-3" },
  { text: "RESPECT", emoji: "💪", bg: "bg-secondary", rotate: "rotate-2" },
  { text: "LEGEND", emoji: "👑", bg: "bg-accent", rotate: "-rotate-2" },
  { text: "GOAT", emoji: "🐐", bg: "bg-primary", rotate: "rotate-3" },
];

export function Footer() {
  const [saluteCount, setSaluteCount] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  const handleFooterSalute = () => {
    setSaluteCount((c) => c + 1);
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 600);
  };

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Zigzag separator */}
      <div
        className="h-3 bg-primary"
        style={{
          clipPath:
            "polygon(0% 100%, 2.5% 0%, 5% 100%, 7.5% 0%, 10% 100%, 12.5% 0%, 15% 100%, 17.5% 0%, 20% 100%, 22.5% 0%, 25% 100%, 27.5% 0%, 30% 100%, 32.5% 0%, 35% 100%, 37.5% 0%, 40% 100%, 42.5% 0%, 45% 100%, 47.5% 0%, 50% 100%, 52.5% 0%, 55% 100%, 57.5% 0%, 60% 100%, 62.5% 0%, 65% 100%, 67.5% 0%, 70% 100%, 72.5% 0%, 75% 100%, 77.5% 0%, 80% 100%, 82.5% 0%, 85% 100%, 87.5% 0%, 90% 100%, 92.5% 0%, 95% 100%, 97.5% 0%, 100% 100%)",
        }}
      />

      {/* Infinite scrolling emoji marquee */}
      <div className="overflow-hidden border-b-3 border-black bg-black py-2.5 sm:py-3">
        <div className="animate-marquee flex w-max gap-4 sm:gap-6">
          {[...MARQUEE_EMOJIS, ...MARQUEE_EMOJIS, ...MARQUEE_EMOJIS].map(
            (emoji, i) => (
              <span
                key={i}
                className="text-lg sm:text-2xl"
                style={{ filter: "grayscale(0)" }}
              >
                {emoji}
              </span>
            ),
          )}
        </div>
      </div>

      {/* Main footer content */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Interactive salute button area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
            className="mb-8 flex flex-col items-center gap-4 sm:mb-10"
          >
            <p className="text-center text-xs font-black uppercase tracking-widest text-black/40 sm:text-sm">
              One more for the road?
            </p>

            {/* Big interactive salute button */}
            <div className="relative">
              {/* Emoji burst */}
              {showBurst && (
                <>
                  {["🫡", "⭐", "🔥", "✨", "💥", "👑"].map((e, i) => (
                    <motion.span
                      key={`burst-${i}-${saluteCount}`}
                      initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                      animate={{
                        opacity: 0,
                        scale: 1.5,
                        x: (Math.random() - 0.5) * 120,
                        y: -60 - Math.random() * 60,
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="pointer-events-none absolute top-1/2 left-1/2 z-10 text-lg sm:text-2xl"
                    >
                      {e}
                    </motion.span>
                  ))}
                </>
              )}

              <motion.button
                onClick={handleFooterSalute}
                whileHover={{ scale: 1.08, rotate: -2, y: -4 }}
                whileTap={{ scale: 0.92, rotate: 2, y: 4 }}
                className="relative rounded-2xl border-4 border-black bg-positive px-8 py-4 text-xl font-black uppercase shadow-[6px_6px_0px_#000] transition-shadow hover:shadow-[8px_8px_0px_#000] active:shadow-[2px_2px_0px_#000] sm:rounded-3xl sm:px-12 sm:py-6 sm:text-3xl sm:shadow-[8px_8px_0px_#000]"
              >
                <span className="mr-2">🫡</span>
                SALUTE!
              </motion.button>
            </div>

            {saluteCount > 0 && (
              <motion.p
                key={saluteCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-black uppercase sm:text-base"
              >
                {saluteCount === 1
                  ? "1 salute! Legend!"
                  : saluteCount < 5
                    ? `${saluteCount} salutes! Keep going!`
                    : saluteCount < 10
                      ? `${saluteCount} salutes! Unstoppable!`
                      : `${saluteCount} salutes! You're the real GOAT 🐐`}
              </motion.p>
            )}
          </motion.div>

          {/* Sticker badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.08 }}
            className="mb-8 flex flex-wrap items-center justify-center gap-2.5 sm:mb-10 sm:gap-4"
          >
            {stickers.map((sticker, i) => (
              <motion.div
                key={sticker.text}
                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 12,
                }}
                whileHover={{ scale: 1.15, rotate: 0, y: -4 }}
                className={`${sticker.bg} ${sticker.rotate} flex items-center gap-1.5 rounded-xl border-3 border-black px-3 py-2 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm sm:shadow-[4px_4px_0px_#000] ${sticker.bg === "bg-primary" || sticker.bg === "bg-secondary" ? "text-white" : "text-black"}`}
              >
                <span className="text-sm sm:text-lg">{sticker.emoji}</span>
                {sticker.text}
              </motion.div>
            ))}
          </motion.div>

          {/* Divider */}
          <div className="border-t-3 border-dashed border-black/15" />

          {/* Bottom section */}
          <div className="mt-6 flex flex-col items-center gap-5 sm:mt-8 sm:flex-row sm:justify-between">
            {/* Brand */}
            <div className="text-center sm:text-left">
              <Link href="/" className="group inline-block">
                <h3 className="text-xl font-black uppercase sm:text-2xl">
                  Salute<span className="text-primary transition-colors group-hover:text-positive">Button</span>
                </h3>
              </Link>
              <p className="mt-1 text-xs font-bold text-black/40 sm:text-sm">
                The internet&apos;s way of showing respect.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/leaderboard"
                className="rounded-xl border-3 border-black bg-accent px-3 py-1.5 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] sm:px-4 sm:py-2 sm:text-xs"
              >
                🏆 Leaderboard
              </Link>
              <Link
                href="/"
                className="rounded-xl border-3 border-black bg-positive px-3 py-1.5 text-[10px] font-black uppercase shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] sm:px-4 sm:py-2 sm:text-xs"
              >
                🫡 Start Saluting
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 flex flex-col items-center gap-2 sm:mt-8 sm:flex-row sm:justify-between">
            <p className="text-[10px] font-bold text-black/30 sm:text-xs">
              &copy; {new Date().getFullYear()} SaluteButton. All rights reserved.
            </p>
            <motion.p
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 text-[10px] font-black text-black/40 sm:text-xs"
            >
              Built with
              <motion.span
                animate={{ rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                className="inline-block text-sm"
              >
                🫡
              </motion.span>
              &amp;
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
                className="inline-block text-sm"
              >
                ❤️
              </motion.span>
            </motion.p>
          </div>
        </div>
      </div>

      {/* Bottom zigzag */}
      <div
        className="h-2 bg-accent"
        style={{
          clipPath:
            "polygon(0% 0%, 2.5% 100%, 5% 0%, 7.5% 100%, 10% 0%, 12.5% 100%, 15% 0%, 17.5% 100%, 20% 0%, 22.5% 100%, 25% 0%, 27.5% 100%, 30% 0%, 32.5% 100%, 35% 0%, 37.5% 100%, 40% 0%, 42.5% 100%, 45% 0%, 47.5% 100%, 50% 0%, 52.5% 100%, 55% 0%, 57.5% 100%, 60% 0%, 62.5% 100%, 65% 0%, 67.5% 100%, 70% 0%, 72.5% 100%, 75% 0%, 77.5% 100%, 80% 0%, 82.5% 100%, 85% 0%, 87.5% 100%, 90% 0%, 92.5% 100%, 95% 0%, 97.5% 100%, 100% 0%)",
        }}
      />
    </footer>
  );
}
