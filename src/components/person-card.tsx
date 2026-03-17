"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SaluteButton } from "./salute-button";
import { DisrespectButton } from "./disrespect-button";
import { ShareButton } from "./share-button";
import { api } from "@/lib/api";
import type { Celeb } from "@/types";

interface PersonCardProps {
  celeb: Celeb;
  index: number;
  size?: "default" | "large";
}

const TILTS = [-2, 1.5, 2, -1.5, -1, 2.5, 1, -2.5];

export function PersonCard({ celeb, index, size = "default" }: PersonCardProps) {
  const lg = size === "large";
  const tilt = TILTS[index % TILTS.length];
  const cardRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
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

  // Keep refs in sync when server counts arrive (from other users)
  useEffect(() => {
    if (celeb.respectors > liveSaluteCount.current) {
      liveSaluteCount.current = celeb.respectors;
      lastSyncedSalute.current = celeb.respectors;
    }
    if (celeb.dispiters > liveDispiteCount.current) {
      liveDispiteCount.current = celeb.dispiters;
      lastSyncedDispite.current = celeb.dispiters;
    }
  }, [celeb.respectors, celeb.dispiters]);

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

  // Live counts for the info tooltip
  const [infoSalute, setInfoSalute] = useState(celeb.respectors);
  const [infoDispite, setInfoDispite] = useState(celeb.dispiters);

  useEffect(() => {
    const onSalute = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d.celebId === celeb._id) setInfoSalute(d.respectors);
    };
    const onDispite = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d.celebId === celeb._id) setInfoDispite(d.dispiters);
    };
    window.addEventListener("salute-update", onSalute);
    window.addEventListener("dispite-update", onDispite);
    return () => {
      window.removeEventListener("salute-update", onSalute);
      window.removeEventListener("dispite-update", onDispite);
    };
  }, [celeb._id]);

  useEffect(() => {
    setInfoSalute((p) => Math.max(p, celeb.respectors));
    setInfoDispite((p) => Math.max(p, celeb.dispiters));
  }, [celeb.respectors, celeb.dispiters]);

  return (
    <div ref={cardRef} className={shareOpen ? "relative z-50" : "relative"}>
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
        className={lg
          ? "neo-brutal relative flex flex-col items-center bg-white px-5 pb-8 pt-20 sm:px-8 sm:pb-10 sm:pt-28"
          : "neo-brutal relative flex flex-col items-center bg-white px-3 pb-4 pt-12 sm:px-6 sm:pb-6 sm:pt-20"}
      >
        {/* Share button */}
        <ShareButton
          celebId={celeb._id}
          celebName={celeb.name}
          respectors={infoSalute}
          className={lg ? "absolute top-3 right-3 z-10" : "absolute top-2 right-2 z-10 sm:top-3 sm:right-3"}
          onToggle={setShareOpen}
          size={lg ? "large" : "default"}
        />

        {/* Info button — only show when any count > 999 */}
        {(infoSalute > 999 || infoDispite > 999) && (
          <>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowInfo((v) => !v)}
              className={lg
                ? "absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-accent text-sm font-black shadow-[2px_2px_0px_#000]"
                : "absolute top-2 left-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-accent text-[10px] font-black shadow-[1px_1px_0px_#000] sm:top-3 sm:left-3 sm:h-6 sm:w-6 sm:text-xs"}
              aria-label="Show exact counts"
            >
              i
            </motion.button>

            {/* Info tooltip */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -5 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                  className={lg
                    ? "absolute top-12 left-3 z-20 rounded-lg border-2 border-black bg-white px-4 py-2.5 shadow-[3px_3px_0px_#000]"
                    : "absolute top-8 left-2 z-20 rounded-lg border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_#000] sm:top-10 sm:left-3"}
                >
                  <div className={lg ? "flex flex-col gap-1.5 text-sm font-bold" : "flex flex-col gap-1 text-[10px] font-bold sm:text-xs"}>
                    <span>🫡 {infoSalute.toLocaleString()}</span>
                    <span>😤 {infoDispite.toLocaleString()}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Circular image — overlaps the top edge */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring" as const, stiffness: 300 }}
          className={lg
            ? "absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 overflow-hidden rounded-full border-4 border-black bg-gray-200 shadow-[5px_5px_0px_#000] sm:-top-20 sm:h-40 sm:w-40"
            : "absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 overflow-hidden rounded-full border-3 border-black bg-gray-200 shadow-[3px_3px_0px_#000] sm:-top-14 sm:h-28 sm:w-28 sm:border-4 sm:shadow-[4px_4px_0px_#000]"}
        >
          <Image
            src={celeb.image}
            alt={celeb.name}
            fill
            className="object-cover"
            sizes={lg ? "(max-width: 640px) 128px, 160px" : "(max-width: 640px) 64px, 112px"}
            unoptimized
          />
        </motion.div>

        {/* Name */}
        <h3 className={lg
          ? "mt-2 text-center text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl"
          : "mt-1 text-center text-sm font-black uppercase leading-tight tracking-tight sm:mt-2 sm:text-xl"}>
          {celeb.name}
        </h3>

        {/* Category badge */}
        <motion.span
          whileHover={{ scale: 1.1, rotate: -3 }}
          className={lg
            ? "mt-2.5 cursor-default rounded-full border-2 border-black bg-primary-light px-5 py-1.5 text-sm font-black uppercase shadow-[2px_2px_0px_#000]"
            : "mt-1.5 cursor-default rounded-md border-2 border-black bg-primary-light px-2.5 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] sm:mt-2.5 sm:rounded-full sm:px-4 sm:py-1 sm:text-xs"}
        >
          {celeb.category?.name ?? "Unknown"}
        </motion.span>

        {/* Dashed separator */}
        <div className={lg ? "my-4 w-full border-t-2 border-dashed border-gray-300" : "my-2 w-full border-t-2 border-dashed border-gray-300 sm:my-3"} />

        {/* Comment/description as a quote bubble */}
        {celeb.comment && (
          <div className={lg
            ? "mb-4 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3"
            : "mb-2.5 w-full rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 sm:mb-3 sm:rounded-xl sm:px-3 sm:py-2"}>
            <p className={lg
              ? "line-clamp-3 text-center text-sm leading-relaxed italic text-gray-500"
              : "line-clamp-2 text-center text-[10px] leading-relaxed italic text-gray-500 sm:text-sm"}>
              &ldquo;{celeb.comment}&rdquo;
            </p>
          </div>
        )}

        {/* Buttons — always side by side, scale down to fit */}
        <div className={lg ? "flex w-full items-center justify-center gap-4" : "flex w-full items-center justify-center gap-1.5 sm:gap-3"}>
          <SaluteButton
            initialCount={celeb.respectors}
            onSalute={handleSalute}
            onPress={handleSalutePress}
            className="min-w-0"
            size={lg ? "large" : "default"}
          />
          <DisrespectButton
            initialCount={celeb.dispiters}
            onDisrespect={handleDisrespect}
            onPress={handleDispitePress}
            className="min-w-0"
            size={lg ? "large" : "default"}
          />
        </div>
      </motion.div>
    </div>
  );
}
