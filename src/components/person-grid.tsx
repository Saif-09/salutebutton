"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonCard } from "./person-card";
import { SearchBar } from "./search-bar";
import { CategoryFilter } from "./category-filter";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Celeb, Category } from "@/types";

export function PersonGrid() {
  const [celebs, setCelebs] = useState<Celeb[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCelebs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await api(`/api/celebs?${params}`);
      const data = await res.json();
      setCelebs(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    api("/api/categories")
      .then((r) => r.json())
      .then((cats: Category[]) => {
        setCategories(cats);
        if (cats.length > 0) setSelectedCategory(cats[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchCelebs, 300);
    return () => clearTimeout(timeout);
  }, [fetchCelebs]);

  // Socket.IO: update counts from other users in real-time
  useEffect(() => {
    const socket = getSocket();
    const handleReaction = (data: {
      celebId: string;
      respectors: number;
      dispiters: number;
    }) => {
      setCelebs((prev) =>
        prev.map((c) =>
          c._id === data.celebId
            ? {
                ...c,
                respectors: Math.max(c.respectors, data.respectors),
                dispiters: Math.max(c.dispiters, data.dispiters),
              }
            : c,
        ),
      );
    };
    socket.on("celeb-reaction", handleReaction);
    return () => {
      socket.off("celeb-reaction", handleReaction);
    };
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Search + Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mx-auto mt-4 w-full max-w-3xl sm:mt-6"
      >
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </motion.div>

      {/* Smash that button CTA */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="rounded-full border-3 border-black bg-white px-4 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0px_#000] sm:px-6 sm:py-2 sm:text-base sm:shadow-[4px_4px_0px_#000]">
          <motion.span
            animate={{ rotate: [0, 15, -15, 15, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
            className="mr-1 inline-block"
          >
            👇
          </motion.span>
          Smash that button!
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="h-10 w-10 rounded-full border-4 border-black border-t-transparent"
            />
          </motion.div>
        ) : celebs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="py-20 text-center"
          >
            <motion.p
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
              className="text-6xl"
            >
              😭
            </motion.p>
            <p className="mt-4 text-xl font-black uppercase">Nobody Found!</p>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              Bro are you even typing real words?
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-x-3 gap-y-12 pt-10 sm:gap-x-7 sm:gap-y-20 sm:pt-16 lg:grid-cols-3 xl:grid-cols-4"
          >
            {celebs.map((celeb, index) => (
              <PersonCard key={celeb._id} celeb={celeb} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
