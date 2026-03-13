"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="hide-scrollbar flex flex-wrap items-center justify-center gap-2 pt-4 sm:gap-3 sm:pt-6">
      {categories.map((cat, i) => (
        <motion.button
          key={cat._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat._id)}
          className={cn(
            "rounded-xl border-3 border-black px-3 py-1.5 text-xs font-bold transition-colors sm:px-6 sm:py-2.5 sm:text-sm",
            selected === cat._id
              ? "bg-blue-500 text-white shadow-[3px_3px_0px_#000]"
              : "bg-white text-black shadow-[3px_3px_0px_#000]",
          )}
        >
          {cat.name}
        </motion.button>
      ))}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: categories.length * 0.05 }}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-xl border-3 border-black px-3 py-1.5 text-xs font-bold transition-colors sm:px-6 sm:py-2.5 sm:text-sm",
          !selected
            ? "bg-blue-500 text-white shadow-[3px_3px_0px_#000]"
            : "bg-white text-black shadow-[3px_3px_0px_#000]",
        )}
      >
        All
      </motion.button>
    </div>
  );
}
