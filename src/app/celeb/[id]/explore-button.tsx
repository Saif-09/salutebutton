"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function ExploreButton() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Link
        href="/"
        className="neo-brutal inline-flex items-center gap-2 px-8 py-3 text-sm font-black uppercase tracking-wide text-white transition-transform hover:-translate-y-1 hover:scale-105 sm:text-base"
        style={{ backgroundColor: "#FF7F3E" }}
      >
        Explore More 🫡
      </Link>
    </motion.div>
  );
}
