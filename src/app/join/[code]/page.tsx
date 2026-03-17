"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/auth-slice";
import { api } from "@/lib/api";

type GroupPreview = {
  _id: string;
  name: string;
  code: string;
  memberCount: number;
  profileCount: number;
  createdBy: string;
};

export default function JoinGroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}/api/groups/preview/${code}`,
        );
        if (!res.ok) { setNotFound(true); return; }
        setPreview(await res.json());
      } catch {
        setNotFound(true);
      } finally {
        setLoadingPreview(false);
      }
    };
    fetchPreview();
  }, [code]);

  const handleJoin = async () => {
    setJoining(true);
    setError("");
    try {
      const res = await api("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.includes("already")) {
          setAlreadyMember(true);
          // Navigate to the group
          router.push(`/group/${preview?._id}`);
          return;
        }
        setError(data.error || "Failed to join group");
        return;
      }
      router.push(`/group/${data._id}`);
    } catch {
      setError("Network error, please try again");
    } finally {
      setJoining(false);
    }
  };

  if (loadingPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="h-10 w-10 rounded-full border-4 border-black border-t-transparent"
        />
      </div>
    );
  }

  if (notFound || !preview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-6xl">😵</p>
        <p className="text-2xl font-black uppercase">Group not found</p>
        <p className="text-gray-500">This invite link may be invalid or expired.</p>
        <Link
          href="/"
          className="rounded-xl border-3 border-black bg-black px-6 py-3 font-black uppercase text-white shadow-[4px_4px_0px_#555] transition-all hover:-translate-y-1"
        >
          ← Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Group card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
        className="neo-brutal w-full max-w-sm bg-white px-8 py-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-4 text-5xl"
        >
          🫡
        </motion.div>

        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
          You&apos;re invited to join
        </p>

        <h1 className="mt-2 text-2xl font-black uppercase leading-tight sm:text-3xl">
          {preview.name}
        </h1>

        <div className="my-5 flex justify-center gap-4">
          <div className="rounded-xl border-2 border-black bg-primary-light px-4 py-2 text-center shadow-[2px_2px_0px_#000]">
            <p className="text-lg font-black">{preview.memberCount}</p>
            <p className="text-[10px] font-bold uppercase text-gray-500">Members</p>
          </div>
          <div className="rounded-xl border-2 border-black bg-primary-light px-4 py-2 text-center shadow-[2px_2px_0px_#000]">
            <p className="text-lg font-black">{preview.profileCount}</p>
            <p className="text-[10px] font-bold uppercase text-gray-500">Profiles</p>
          </div>
        </div>

        <p className="mb-6 text-xs text-gray-400">
          Created by <span className="font-black text-black">{preview.createdBy}</span>
        </p>

        <div className="border-t-2 border-dashed border-gray-200 pt-6">
          {isAuthenticated ? (
            <>
              {error && (
                <p className="mb-3 text-sm font-bold text-red-500">{error}</p>
              )}
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleJoin}
                disabled={joining || alreadyMember}
                className="w-full rounded-xl border-3 border-black py-3.5 text-base font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000] disabled:opacity-60"
                style={{ backgroundColor: "#D6293E" }}
              >
                {joining ? "Joining..." : "🫡 Join Group"}
              </motion.button>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm font-bold text-gray-500">
                You need to be logged in to join
              </p>
              <Link
                href={`/?join=${code}`}
                className="block w-full rounded-xl border-3 border-black py-3.5 text-center text-base font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000]"
                style={{ backgroundColor: "#D6293E" }}
              >
                🔐 Login to Join
              </Link>
            </>
          )}
        </div>
      </motion.div>

      <Link
        href="/"
        className="mt-6 text-xs font-bold uppercase text-gray-400 underline hover:text-black"
      >
        Go to SaluteButton
      </Link>
    </div>
  );
}
