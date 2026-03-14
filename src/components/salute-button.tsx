"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SALUTE_EMOJIS } from "@/constants/site";
import type { Particle } from "@/types";

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

interface SaluteButtonProps {
  initialCount: number;
  onSalute: (count: number) => void;
  onPress?: () => void;
  className?: string;
}

export function SaluteButton({
  initialCount,
  onSalute,
  onPress,
  className,
}: SaluteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pressed, setPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with server count (from other users via socket)
  useEffect(() => {
    if (initialCount > count) {
      setCount(initialCount);
    }
  }, [initialCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);

    setPressed(true);
    setTimeout(() => setPressed(false), 200);

    onPress?.();

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    const emoji =
      SALUTE_EMOJIS[Math.floor(Math.random() * SALUTE_EMOJIS.length)];
    const particle: Particle = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 100,
      emoji,
    };
    setParticles((prev) => [...prev, particle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== particle.id));
    }, 1200);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onSalute(newCount);
    }, 2000);
  }, [count, onSalute]);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, y: 0, x: p.x, scale: 0.5 }}
            animate={{ opacity: 0, y: -120, scale: 1.6, rotate: 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="pointer-events-none absolute -top-2 text-xl sm:text-2xl"
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* 3D Pill Button */}
      <motion.button
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95, y: 2 }}
        onClick={handleClick}
        className={cn(
          "relative flex select-none items-center gap-1 rounded-xl border-3 border-black bg-positive px-3 py-1.5 font-black transition-all sm:gap-1.5 sm:px-4 sm:py-2",
          pressed
            ? "translate-y-[3px] shadow-[1px_1px_0px_#000]"
            : "shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#000]",
        )}
        aria-label="Salute"
      >
        <motion.span
          animate={pressed ? { scale: [1, 1.4, 1], rotate: [0, 15, 0] } : {}}
          transition={{ duration: 0.3 }}
          className="inline-block text-base sm:text-xl"
        >
          🫡
        </motion.span>
        <motion.span
          key={count}
          initial={{ scale: 1.4, y: -3 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
          className="text-sm tabular-nums sm:text-base"
        >
          {formatCount(count)}
        </motion.span>
      </motion.button>
    </div>
  );
}
