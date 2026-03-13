"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
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
  const { isAuthenticated, username } = useAppSelector((s) => s.auth);

  return (
    <>
      <nav className="sticky top-0 z-50 px-2 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Left — Feedback */}
          <motion.button
            custom={0}
            initial="hidden"
            animate="visible"
            variants={navItemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={() => setFeedbackOpen(true)}
            className="rounded-xl border-3 border-black bg-amber-400 px-3 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_#000] transition-shadow hover:shadow-[6px_6px_0px_#000] active:shadow-[2px_2px_0px_#000] sm:px-5 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
          >
            💬 <span className="hidden sm:inline">Feedback</span>
          </motion.button>

          {/* Right — Groups, Login, Leaderboard */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <motion.button
              custom={1}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={() => setGroupsOpen(true)}
              className="rounded-xl border-3 border-black bg-purple-500 px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-shadow hover:shadow-[6px_6px_0px_#000] active:shadow-[2px_2px_0px_#000] sm:px-5 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
            >
              👥 <span className="hidden sm:inline">Groups</span>
            </motion.button>

            <motion.button
              custom={2}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 2 }}
              onClick={() => setLoginOpen(true)}
              className="rounded-xl border-3 border-black bg-violet-400 px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-shadow hover:shadow-[6px_6px_0px_#000] active:shadow-[2px_2px_0px_#000] sm:px-5 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
            >
              🔐 <span className="hidden sm:inline">{isAuthenticated ? username : "Login"}</span>
            </motion.button>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={navItemVariants}
            >
              <Link
                href="/leaderboard"
                className="block rounded-xl border-3 border-black bg-green-500 px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] sm:px-5 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
              >
                🏆 <span className="hidden sm:inline">Leaderboard</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <GroupsModal
        open={groupsOpen}
        onClose={() => setGroupsOpen(false)}
        onOpenLogin={() => setLoginOpen(true)}
      />
    </>
  );
}
