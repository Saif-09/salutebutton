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
        className="relative cursor-pointer overflow-hidden rounded-2xl border-3 border-black bg-secondary shadow-[4px_4px_0px_#000] transition-shadow hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] sm:rounded-3xl sm:border-4 sm:shadow-[6px_6px_0px_#000]"
      >
        {/* ===== MOBILE: compact single-row layout ===== */}
        <div className="flex items-center gap-3 px-4 py-3 sm:hidden">
          <motion.span
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            className="text-2xl"
          >
            👻
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase leading-tight text-white">
              Play with your <span className="text-accent">Squad!</span>
            </p>
            <p className="mt-0.5 text-[11px] font-semibold leading-tight text-white/60">
              Create groups, add friends &amp; vote together
            </p>
          </div>
          <span className="shrink-0 rounded-lg border-2 border-black bg-accent px-3 py-1.5 text-xs font-black uppercase text-black shadow-[2px_2px_0px_#000]">
            Try it
          </span>
        </div>

        {/* ===== DESKTOP: expanded layout ===== */}
        <div className="hidden sm:block sm:px-10 sm:py-10">
          {/* Background decorative emojis */}
          <div className="pointer-events-none absolute inset-0 select-none overflow-hidden opacity-10">
            <span className="absolute -top-2 -right-4 text-9xl">👻</span>
            <span className="absolute -bottom-4 -left-4 text-9xl">🫡</span>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                className="text-5xl"
              >
                👻
              </motion.div>
              <h2 className="text-4xl font-black uppercase tracking-tight text-white">
                Play with your{" "}
                <span className="text-accent">Squad!</span>
              </h2>
              <p className="max-w-md text-base font-semibold text-white/70">
                Create a private group, add your friends or anyone you want, and vote together to crown the ultimate GOAT.
              </p>
            </div>

            {/* Feature pills */}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {[
                { emoji: "👻", text: "Create a group with your squad" },
                { emoji: "🖼️", text: "Add people or profiles to vote on" },
                { emoji: "🫡", text: "Salute or disrespect — let the votes decide!" },
                { emoji: "🏆", text: "See who's the real GOAT on the leaderboard" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 200 }}
                  className="flex items-center gap-1.5 rounded-full border-3 border-black bg-white px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#000]"
                >
                  <span>{f.emoji}</span>
                  <span>{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className="rounded-xl border-3 border-black bg-accent px-8 py-4 text-lg font-black uppercase text-black shadow-[4px_4px_0px_#000]">
                🚀 Try Groups Now
              </span>
              <span className="rounded-xl border-3 border-black bg-white/15 px-8 py-4 text-lg font-black uppercase text-white shadow-[4px_4px_0px_#000]">
                🤝 Join a Group
              </span>
            </div>

            {/* How it works */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2 text-sm font-bold text-white/50">
                <span className="rounded-lg border-2 border-white/30 px-2 py-0.5">1. Create</span>
                <span>→</span>
                <span className="rounded-lg border-2 border-white/30 px-2 py-0.5">2. Invite</span>
                <span>→</span>
                <span className="rounded-lg border-2 border-white/30 px-2 py-0.5">3. Vote</span>
                <span>→</span>
                <span className="rounded-lg border-2 border-white/30 px-2 py-0.5">4. Fun!</span>
              </div>
            </div>
          </div>
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
