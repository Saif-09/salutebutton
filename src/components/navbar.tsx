"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeedbackModal } from "./feedback-modal";
import { LoginModal } from "./login-modal";
import { GroupsModal } from "./groups-modal";
import { useAppSelector } from "@/store/hooks";

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring" as const, stiffness: 300 },
  }),
};

export function Navbar() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [groupsInitialView, setGroupsInitialView] = useState<"menu" | "my-groups">("menu");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, username } = useAppSelector((s) => s.auth);

  return (
    <>
      <nav className="sticky top-0 z-50 px-2 pt-2 sm:px-4 sm:pt-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-1 sm:px-2">
          {/* Left — Menu drawer toggle */}
          <motion.button
            custom={0}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border-3 border-black bg-black px-3 py-1.5 text-xs font-black uppercase text-white shadow-[2px_2px_0px_#000] transition-shadow hover:shadow-[4px_4px_0px_#000] active:shadow-[1px_1px_0px_#000] sm:px-5 sm:py-2 sm:text-sm sm:shadow-[3px_3px_0px_#000]"
          >
            <span className="text-base leading-none">☰</span>
            <span className="hidden sm:inline">Menu</span>
          </motion.button>

          {/* Right — Leaderboard */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
          >
            <Link
              href="/leaderboard"
              className="block rounded-xl border-3 border-black bg-accent px-3 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] sm:px-5 sm:py-2 sm:text-sm sm:shadow-[3px_3px_0px_#000]"
            >
              🏆 Leaderboard
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Drawer overlay + panel */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-[70] flex h-full w-72 flex-col border-r-4 border-black bg-white sm:w-80"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b-3 border-black px-5 py-4">
                <span className="text-lg font-black uppercase">Menu</span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-3 border-black bg-primary-light text-lg font-black shadow-[2px_2px_0px_#000] transition-all hover:shadow-[3px_3px_0px_#000] active:shadow-[1px_1px_0px_#000]"
                >
                  ✕
                </button>
              </div>

              {/* Drawer items */}
              <div className="flex flex-col gap-3 p-5">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setGroupsInitialView("menu");
                    setGroupsOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border-3 border-black bg-secondary px-4 py-3 text-left text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
                >
                  <span className="text-lg">👻</span>
                  Groups
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setGroupsInitialView("my-groups");
                    setGroupsOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border-3 border-black bg-positive px-4 py-3 text-left text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
                >
                  <span className="text-lg">🔍</span>
                  My Groups
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setLoginOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border-3 border-black bg-secondary-light px-4 py-3 text-left text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
                >
                  <span className="text-lg">🔐</span>
                  {isAuthenticated ? username : "Login"}
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    setFeedbackOpen(true);
                  }}
                  className="flex items-center gap-3 rounded-xl border-3 border-black bg-primary px-4 py-3 text-left text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
                >
                  <span className="text-lg">💬</span>
                  Feedback
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <GroupsModal
        open={groupsOpen}
        onClose={() => setGroupsOpen(false)}
        onOpenLogin={() => setLoginOpen(true)}
        initialView={groupsInitialView}
      />
    </>
  );
}
