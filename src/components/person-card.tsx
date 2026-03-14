"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { SaluteButton } from "./salute-button";
import { DisrespectButton } from "./disrespect-button";
import { api } from "@/lib/api";
import type { Celeb } from "@/types";

interface PersonCardProps {
  celeb: Celeb;
  index: number;
}

const TILTS = [-2, 1.5, 2, -1.5, -1, 2.5, 1, -2.5];

export function PersonCard({ celeb, index }: PersonCardProps) {
  const tilt = TILTS[index % TILTS.length];
  const cardRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  const popCard = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    // Cancel any running animation so rapid clicks restart cleanly
    if (animRef.current) animRef.current.cancel();
    animRef.current = el.animate(
      [
        { transform: "scale(1) translateY(0) rotate(0deg)", offset: 0 },
        { transform: "scale(1.07) translateY(-8px) rotate(-3deg)", offset: 0.2 },
        { transform: "scale(0.97) translateY(3px) rotate(3deg)", offset: 0.4 },
        { transform: "scale(1.03) translateY(-2px) rotate(-1.5deg)", offset: 0.65 },
        { transform: "scale(1) translateY(0) rotate(0deg)", offset: 1 },
      ],
      { duration: 400, easing: "ease-out", fill: "none" },
    );
  }, []);

  const lastSyncedSalute = useRef(celeb.respectors);
  const lastSyncedDispite = useRef(celeb.dispiters);
  const liveSaluteCount = useRef(celeb.respectors);
  const liveDispiteCount = useRef(celeb.dispiters);

  const handleSalutePress = useCallback(() => {
    liveSaluteCount.current += 1;
    window.dispatchEvent(
      new CustomEvent("salute-update", {
        detail: { celebId: celeb._id, respectors: liveSaluteCount.current },
      }),
    );
  }, [celeb._id]);

  const handleDispitePress = useCallback(() => {
    liveDispiteCount.current += 1;
    window.dispatchEvent(
      new CustomEvent("dispite-update", {
        detail: { celebId: celeb._id, dispiters: liveDispiteCount.current },
      }),
    );
  }, [celeb._id]);

  const handleSalute = async (count: number) => {
    popCard();
    liveSaluteCount.current = count;
    const delta = count - lastSyncedSalute.current;
    lastSyncedSalute.current = count;
    if (delta <= 0) return;

    try {
      await api(`/api/celebs/${celeb._id}/reactions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "respect", count: delta }),
      });
    } catch {
      // Silently fail — optimistic UI
    }
  };

  const handleDisrespect = async (count: number) => {
    popCard();
    const delta = count - lastSyncedDispite.current;
    lastSyncedDispite.current = count;
    if (delta <= 0) return;
    try {
      await api(`/api/celebs/${celeb._id}/reactions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "dispite", count: delta }),
      });
    } catch {
      // Silently fail — optimistic UI
    }
  };

  return (
    <div ref={cardRef}>
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: 0, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: index * 0.04,
          type: "spring" as const,
          stiffness: 180,
          damping: 18,
        }}
        whileHover={{ rotate: 0, y: -8, scale: 1.04 }}
        className="neo-brutal relative flex flex-col items-center bg-white px-3 pb-4 pt-12 sm:px-6 sm:pb-8 sm:pt-20"
      >
        {/* Circular image — overlaps the top edge */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring" as const, stiffness: 300 }}
          className="absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 overflow-hidden rounded-full border-3 border-black bg-gray-200 shadow-[3px_3px_0px_#000] sm:-top-14 sm:h-28 sm:w-28 sm:border-4 sm:shadow-[4px_4px_0px_#000]"
        >
          <Image
            src={celeb.image}
            alt={celeb.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 64px, 112px"
            unoptimized
          />
        </motion.div>

        {/* Name */}
        <h3 className="mt-1 text-center text-sm font-black uppercase leading-tight tracking-tight sm:mt-2 sm:text-xl">
          {celeb.name}
        </h3>

        {/* Category badge */}
        <motion.span
          whileHover={{ scale: 1.1, rotate: -3 }}
          className="mt-1.5 cursor-default rounded-md border-2 border-black bg-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] sm:mt-2.5 sm:rounded-full sm:px-4 sm:py-1 sm:text-xs"
        >
          {celeb.category?.name ?? "Unknown"}
        </motion.span>

        {/* Dashed separator */}
        <div className="my-2 w-full border-t-2 border-dashed border-gray-300 sm:my-3" />

        {/* Comment/description in quotes */}
        {celeb.comment && (
          <p className="mb-2 line-clamp-2 text-center text-[10px] italic text-gray-500 sm:mb-3 sm:text-sm">
            &ldquo;{celeb.comment}&rdquo;
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SaluteButton
            initialCount={celeb.respectors}
            onSalute={handleSalute}
            onPress={handleSalutePress}
          />
          <DisrespectButton
            initialCount={celeb.dispiters}
            onDisrespect={handleDisrespect}
            onPress={handleDispitePress}
          />
        </div>
      </motion.div>
    </div>
  );
}
