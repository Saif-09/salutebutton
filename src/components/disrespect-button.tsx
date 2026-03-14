"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCount } from "@/lib/utils";
import { playDisrespectSound } from "@/lib/sounds";
import type { Particle } from "@/types";

const ANGRY_EMOJIS = ["😤", "💢", "🔥", "👎", "💀"];

interface DisrespectButtonProps {
  initialCount: number;
  onDisrespect: (count: number) => void;
  onPress?: () => void;
  className?: string;
}

export function DisrespectButton({
  initialCount,
  onDisrespect,
  onPress,
  className,
}: DisrespectButtonProps) {
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
      navigator.vibrate([40, 20, 60, 30, 20, 40, 30]);
    }
    playDisrespectSound();

    const emoji =
      ANGRY_EMOJIS[Math.floor(Math.random() * ANGRY_EMOJIS.length)];
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
      onDisrespect(newCount);
    }, 2000);
  }, [count, onDisrespect]);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, y: 0, x: p.x, scale: 0.5 }}
            animate={{ opacity: 0, y: -120, scale: 1.6, rotate: -30 }}
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
          "relative flex max-w-full select-none items-center gap-1 overflow-hidden rounded-xl border-3 border-black bg-primary px-2 py-1 font-black text-white transition-all sm:gap-1.5 sm:px-4 sm:py-2",
          pressed
            ? "translate-y-[3px] shadow-[1px_1px_0px_#000]"
            : "shadow-[4px_4px_0px_#000] hover:shadow-[5px_5px_0px_#000]",
        )}
        aria-label="Disrespect"
      >
        <motion.span
          animate={
            pressed
              ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, -10, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          className="inline-block text-base sm:text-xl"
        >
          😤
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
