"use client";

import { motion } from "framer-motion";

export function HeroBanner() {
  return (
    <div className="flex flex-col items-center gap-3 py-3 sm:gap-4 sm:py-4">
      {/* Smash that button pill */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="rounded-full border-3 border-black bg-white px-4 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] sm:px-6 sm:py-2 sm:text-base sm:shadow-[4px_4px_0px_#000]"
      >
        <motion.span
          animate={{ rotate: [0, 15, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
          className="mr-1 inline-block"
        >
          👆
        </motion.span>
        Smash that button!
      </motion.div>

      {/* Big red tilted banner */}
      <motion.div
        initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
        animate={{ rotate: -3, scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 12 }}
        whileHover={{ rotate: 0, scale: 1.03 }}
        className="relative cursor-default rounded-2xl border-4 border-black bg-red-500 px-6 py-5 shadow-[5px_5px_0px_#000] sm:px-16 sm:py-10 sm:shadow-[8px_8px_0px_#000]"
      >
        <h1 className="text-center text-2xl leading-tight font-black tracking-tight text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] sm:text-6xl lg:text-7xl">
          SALUTE
          <br />
          <span className="text-yellow-300">THE GREATS</span>{" "}
          <motion.span
            animate={{ rotate: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            className="inline-block"
          >
            🫡
          </motion.span>
        </h1>
      </motion.div>
    </div>
  );
}
