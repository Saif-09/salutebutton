"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

type Status = "online" | "no-internet" | "no-backend";

export function ConnectionStatus({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("online");
  const [checking, setChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    // Check internet first
    if (!navigator.onLine) {
      setStatus("no-internet");
      return;
    }

    // Then check backend
    try {
      const res = await fetch(`${API_URL}/api/health`, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setStatus("online");
      } else {
        setStatus("no-backend");
      }
    } catch {
      setStatus("no-backend");
    }
  }, []);

  useEffect(() => {
    checkConnection();

    const interval = setInterval(checkConnection, 15000);

    const goOnline = () => checkConnection();
    const goOffline = () => setStatus("no-internet");

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [checkConnection]);

  const handleRetry = async () => {
    setChecking(true);
    await checkConnection();
    setChecking(false);
  };

  return (
    <>
      <AnimatePresence>
        {status === "no-internet" && (
          <NoInternetScreen onRetry={handleRetry} checking={checking} />
        )}
        {status === "no-backend" && (
          <BackendDownScreen onRetry={handleRetry} checking={checking} />
        )}
      </AnimatePresence>
      {status === "online" && children}
    </>
  );
}

function NoInternetScreen({
  onRetry,
  checking,
}: {
  onRetry: () => void;
  checking: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center gap-5 bg-surface-alt p-8"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="neo-brutal flex flex-col items-center gap-5 px-8 py-10 sm:px-14 sm:py-14"
      >
        <motion.p
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-6xl sm:text-7xl"
        >
          📡
        </motion.p>

        <h1 className="text-center text-2xl font-black uppercase sm:text-3xl">
          No Signal, Soldier!
        </h1>

        <p className="max-w-xs text-center text-sm font-semibold text-black/60 sm:text-base">
          Your internet connection dropped. Check your Wi-Fi or mobile data and
          try again.
        </p>

        <motion.div
          className="mt-2 flex items-center gap-3 rounded-xl border-3 border-black bg-primary px-6 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0px_#000] sm:text-base"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97, x: 2, y: 2 }}
        >
          <button
            onClick={onRetry}
            disabled={checking}
            className="flex items-center gap-2 disabled:opacity-60"
          >
            {checking ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Checking...
              </>
            ) : (
              "Reconnect"
            )}
          </button>
        </motion.div>

        <div className="mt-1 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-negative" />
          <span className="text-xs font-bold uppercase text-black/40">
            Offline
          </span>
        </div>
      </motion.div>
    </motion.main>
  );
}

function BackendDownScreen({
  onRetry,
  checking,
}: {
  onRetry: () => void;
  checking: boolean;
}) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center gap-5 bg-surface-alt p-8"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="neo-brutal flex flex-col items-center gap-5 px-8 py-10 sm:px-14 sm:py-14"
      >
        <motion.p
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 2 }}
          className="text-6xl sm:text-7xl"
        >
          🔧
        </motion.p>

        <h1 className="text-center text-2xl font-black uppercase sm:text-3xl">
          Base is Down!
        </h1>

        <p className="max-w-xs text-center text-sm font-semibold text-black/60 sm:text-base">
          Our servers are taking a quick breather. Hang tight — we&apos;ll be
          back in formation shortly.
        </p>

        <motion.div
          className="mt-2 flex items-center gap-3 rounded-xl border-3 border-black bg-secondary px-6 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0px_#000] sm:text-base"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97, x: 2, y: 2 }}
        >
          <button
            onClick={onRetry}
            disabled={checking}
            className="flex items-center gap-2 disabled:opacity-60"
          >
            {checking ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Checking...
              </>
            ) : (
              "Try Again"
            )}
          </button>
        </motion.div>

        <div className="mt-1 flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
          <span className="text-xs font-bold uppercase text-black/40">
            Server Unavailable
          </span>
        </div>
      </motion.div>
    </motion.main>
  );
}
