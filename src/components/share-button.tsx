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
  size?: "default" | "large";
  // Optional overrides — when provided, used instead of the default celeb share content
  customShareUrl?: string;
  customShareText?: string;
  customShareTitle?: string;
}

export function ShareButton({ celebId, celebName, respectors, className = "", onToggle, size = "default", customShareUrl, customShareText, customShareTitle }: ShareButtonProps) {
  const lg = size === "large";
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

  const shareText = customShareText ?? `${celebName} has ${respectors.toLocaleString()} salutes on SaluteButton! Cast your vote now`;
  const shareUrl = customShareUrl ?? `${siteConfig.url}/celeb/${celebId}`;

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
        await navigator.share({ title: customShareTitle ?? `${celebName} on SaluteButton`, text: shareText, url: shareUrl });
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
        className={lg
          ? "flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-green-100 text-base shadow-[2px_2px_0px_#000] transition-colors hover:bg-green-200"
          : "flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-green-100 text-xs shadow-[1px_1px_0px_#000] transition-colors hover:bg-green-200 sm:h-7 sm:w-7 sm:text-sm"}
        aria-label={`Share ${celebName}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={lg ? "h-5 w-5" : "h-3 w-3 sm:h-3.5 sm:w-3.5"}
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
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp
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
