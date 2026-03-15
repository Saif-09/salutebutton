"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GroupsModal } from "./groups-modal";
import { LoginModal } from "./login-modal";

export function GroupsBanner() {
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 16 }}
        onClick={() => setGroupsOpen(true)}
        className="relative mb-6 sm:mb-6 cursor-pointer overflow-hidden rounded-2xl border-3 border-black bg-secondary shadow-[4px_4px_0px_#000] transition-shadow hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
      >
        <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-5">
          <motion.span
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            className="text-2xl sm:text-4xl"
          >
            👻
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase leading-tight text-white sm:text-lg">
              Play with your <span className="text-accent">Squad!</span>
            </p>
            <p className="mt-0.5 text-[11px] font-semibold leading-tight text-white/60 sm:text-sm">
              Create groups, add friends &amp; vote together
            </p>
          </div>
          <span className="shrink-0 rounded-lg border-2 border-black bg-accent px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000] sm:px-5 sm:py-2.5 sm:text-sm sm:rounded-xl">
            Try it
          </span>
        </div>
      </motion.section>

      <GroupsModal
        open={groupsOpen}
        onClose={() => setGroupsOpen(false)}
        onOpenLogin={() => setLoginOpen(true)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
