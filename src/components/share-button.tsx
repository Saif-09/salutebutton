"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/constants/site";

interface ShareButtonProps {
  celebId: string;
  celebName: string;
  respectors: number;
  className?: string;
  onToggle?: (open: boolean) => void;
}

export function ShareButton({ celebId, celebName, respectors, className = "", onToggle }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(!!navigator.share);
  }, []);

  // Close this menu when another share menu opens
  useEffect(() => {
    const onOtherOpen = (e: Event) => {
      const openedId = (e as CustomEvent).detail;
      if (openedId !== celebId && showMenu) {
        setShowMenu(false);
        onToggle?.(false);
      }
    };
    window.addEventListener("share-menu-open", onOtherOpen);
    return () => window.removeEventListener("share-menu-open", onOtherOpen);
  }, [celebId, showMenu, onToggle]);

  const shareText = `${celebName} has ${respectors.toLocaleString()} salutes on SaluteButton! Cast your vote now`;
  const shareUrl = `${siteConfig.url}/celeb/${celebId}`;

  const handleWhatsApp = useCallback(() => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  }, [shareText, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 1200);
    } catch {
      // Fallback — ignore
    }
  }, [shareText, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${celebName} on SaluteButton`, text: shareText, url: shareUrl });
      } catch {
        // User cancelled or share failed
      }
      setShowMenu(false);
    }
  }, [celebName, shareText, shareUrl]);

  return (
    <div className={className}>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => {
          setShowMenu((v) => {
            const next = !v;
            if (next) {
              window.dispatchEvent(new CustomEvent("share-menu-open", { detail: celebId }));
            }
            onToggle?.(next);
            return next;
          });
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-green-100 text-xs shadow-[1px_1px_0px_#000] transition-colors hover:bg-green-200 sm:h-7 sm:w-7 sm:text-sm"
        aria-label={`Share ${celebName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3 w-3 sm:h-3.5 sm:w-3.5"
        >
          <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .799l6.733 3.364a2.5 2.5 0 11-.671 1.341l-6.733-3.364a2.5 2.5 0 110-3.482l6.733-3.364A2.52 2.52 0 0113 4.5z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop to close menu */}
            <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); onToggle?.(false); }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute top-8 right-0 z-50 flex flex-col gap-1 rounded-lg border-2 border-black bg-white p-2 shadow-[3px_3px_0px_#000]"
            >
              {/* WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-left text-xs font-bold transition-colors hover:bg-green-100 sm:text-sm"
              >
                <span className="text-base">💬</span> WhatsApp
              </button>

              {/* Native share (mobile) */}
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-left text-xs font-bold transition-colors hover:bg-blue-100 sm:text-sm"
                >
                  <span className="text-base">📤</span> More...
                </button>
              )}

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-left text-xs font-bold transition-colors hover:bg-yellow-100 sm:text-sm"
              >
                <span className="text-base">{copied ? "✅" : "📋"}</span>
                {copied ? "Copied!" : "Copy link"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
