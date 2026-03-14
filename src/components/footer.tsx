"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = [
  { label: "Leaderboard", href: "/leaderboard", emoji: "🏆" },
];

const funFacts = [
  "Over 1 million salutes and counting!",
  "Who will you salute today?",
  "Every legend deserves a salute.",
  "Respect is just one click away.",
  "The world's most fun way to show respect.",
];

export function Footer() {
  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <footer className="relative mt-12 px-4 pb-6">
      <div className="mx-auto max-w-6xl">
        {/* Main footer card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="neo-brutal overflow-hidden"
        >
          {/* Top banner strip */}
          <div className="border-b-3 border-black bg-black px-5 py-3 sm:px-8 sm:py-4">
            <p className="text-center text-sm font-black uppercase tracking-wide text-white sm:text-base">
              🫡 {randomFact} 🫡
            </p>
          </div>

          {/* Content area */}
          <div className="bg-white px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Brand section */}
              <div className="text-center sm:text-left">
                <Link href="/" className="inline-block">
                  <h3 className="text-2xl font-black uppercase sm:text-3xl">
                    Salute<span className="text-primary">Button</span>
                  </h3>
                </Link>
                <p className="mt-1.5 max-w-xs text-sm font-bold text-gray-600">
                  Smash that button. Salute the greats. Show some respect.
                </p>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap justify-center gap-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl border-3 border-black bg-accent px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] sm:text-sm"
                  >
                    {link.emoji} {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="my-5 border-t-3 border-dashed border-black/20 sm:my-6" />

            {/* Bottom row */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-xs font-bold text-gray-500 sm:text-sm">
                &copy; {new Date().getFullYear()} SaluteButton. All rights reserved.
              </p>

              <motion.p
                className="text-sm font-black"
                whileHover={{ scale: 1.05 }}
              >
                Made with 🫡 &amp; ❤️
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
