"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { FeedbackType } from "@/types";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

const TYPES: FeedbackType[] = ["feedback", "improvement", "bug", "other"];

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<FeedbackType>("feedback");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message }),
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setName("");
        setEmail("");
        setType("feedback");
        setMessage("");
      }, 1500);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="neo-brutal w-full max-w-md bg-white p-6"
          >
            {submitted ? (
              <div className="py-8 text-center">
                <p className="text-4xl">🎉</p>
                <p className="mt-2 text-lg font-bold">Thanks for your feedback!</p>
              </div>
            ) : (
              <>
                <h2 className="mb-4 text-xl font-black uppercase">
                  💬 Feedback
                </h2>

                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border-2 border-black px-3 py-2 text-sm font-semibold outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border-2 border-black px-3 py-2 text-sm font-semibold outline-none"
                  />

                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`rounded-lg border-2 border-black px-3 py-1 text-xs font-bold uppercase ${
                          type === t
                            ? "bg-black text-white"
                            : "bg-white text-black"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <textarea
                    placeholder="Your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none rounded-lg border-2 border-black px-3 py-2 text-sm font-semibold outline-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="flex-1 rounded-lg border-2 border-black px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim() || submitting}
                      className="flex-1 rounded-lg border-2 border-black bg-secondary px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0px_var(--color-secondary-light)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_var(--color-secondary-light)] disabled:opacity-50"
                    >
                      {submitting ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
