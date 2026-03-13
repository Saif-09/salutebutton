"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 px-2 py-2">
        <motion.span
          animate={{ rotate: focused ? 20 : 0 }}
          className="text-2xl text-gray-400"
        >
          🔍
        </motion.span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") inputRef.current?.blur();
          }}
          placeholder="FIND SOMEONE TO SALUTE!"
          className="w-full bg-transparent text-sm font-bold uppercase tracking-wide text-black outline-none placeholder:text-gray-400 sm:text-lg"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => onChange("")}
              className="text-xl"
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {/* Thick black divider */}
      <div className="mt-2 h-1 w-full rounded-full bg-black" />
    </div>
  );
}
