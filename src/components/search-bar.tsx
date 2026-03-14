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
      <div className="flex items-center gap-2 rounded-xl border-3 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_#000] transition-shadow focus-within:shadow-[5px_5px_0px_#000] sm:px-4 sm:py-2.5 sm:shadow-[4px_4px_0px_#000]">
        <motion.span
          animate={{ rotate: focused ? 20 : 0 }}
          className="text-lg text-gray-400 sm:text-xl"
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
          placeholder="Find someone to salute..."
          className="w-full bg-transparent text-xs font-bold text-black outline-none placeholder:text-gray-400 sm:text-sm"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => onChange("")}
              className="text-sm font-bold text-gray-400"
            >
              ✕
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
