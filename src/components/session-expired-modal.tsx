"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/auth-slice";
import { clearProfile } from "@/store/slices/profile-slice";

export function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handler = () => {
      dispatch(logout());
      dispatch(clearProfile());
      setOpen(true);
    };

    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, [dispatch]);

  const handleClose = () => {
    setOpen(false);
    window.location.href = "/";
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-full rounded-2xl border-3 border-black bg-surface-alt p-6 text-center shadow-[4px_4px_0px_#000]">
                <p className="text-5xl">🔒</p>
                <p className="mt-3 text-xl font-black uppercase">
                  Session Expired
                </p>
                <p className="mt-1.5 text-sm font-semibold text-gray-500">
                  You have been logged out. Please login again to continue.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full rounded-xl border-3 border-black bg-positive px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-positive-dark active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
              >
                🔐 LOGIN AGAIN
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
