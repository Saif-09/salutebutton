"use client";

import { motion } from "framer-motion";

const sparkleVariants = {
  animate: (i: number) => ({
    scale: [1, 1.4, 1],
    opacity: [0.7, 1, 0.7],
    rotate: [0, 20, 0],
    transition: {
      repeat: Infinity,
      duration: 2,
      delay: i * 0.4,
      ease: "easeInOut" as const,
    },
  }),
};

export function HeroBanner() {
  return (
    <div className="flex flex-col items-center gap-3 py-3 sm:gap-5 sm:py-5">
      {/* Glow behind the banner */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-primary/20 blur-2xl sm:-inset-8 sm:blur-3xl"
        />

        {/* Big red tilted banner */}
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ rotate: -3, scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 150,
            damping: 12,
          }}
          whileHover={{ rotate: 0, scale: 1.04 }}
          className="relative cursor-default overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-br from-primary via-primary to-primary-dark px-6 py-5 shadow-[5px_5px_0px_#000] sm:rounded-3xl sm:px-16 sm:py-10 sm:shadow-[8px_8px_0px_#000]"
        >
          {/* Shine overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />

          {/* Corner sparkles */}
          {["top-2 left-3", "top-2 right-3", "bottom-2 left-3", "bottom-2 right-3"].map(
            (pos, i) => (
              <motion.span
                key={pos}
                custom={i}
                variants={sparkleVariants}
                animate="animate"
                className={`absolute ${pos} text-xs sm:text-base pointer-events-none select-none`}
              >
                ✦
              </motion.span>
            )
          )}

          <h1 className="relative text-center text-3xl leading-tight font-black tracking-wide text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] sm:text-6xl sm:tracking-wider lg:text-7xl">
            SALUTE
            <br />
            <span className="bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent drop-shadow-none">
              THE GREATS
            </span>{" "}
            <motion.span
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              className="inline-block drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
            >
              🫡
            </motion.span>
          </h1>
        </motion.div>
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center text-xs font-semibold tracking-widest text-black/40 uppercase sm:text-sm"
      >
        Show love to the people who inspire you
      </motion.p>
    </div>
  );
}
