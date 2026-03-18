"use client";

import { useState, useEffect, useRef, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/auth-slice";
import { fetchProfile } from "@/store/slices/profile-slice";
import { api } from "@/lib/api";
import { SaluteButton } from "@/components/salute-button";
import { DisrespectButton } from "@/components/disrespect-button";
import { ShareButton } from "@/components/share-button";
import { Footer } from "@/components/footer";
import type { Group, GroupProfile } from "@/types";

const TILTS = [-2, 1.5, 2, -1.5, -1, 2.5, 1, -2.5];
const ROW_COLORS = [
  "bg-orange-200",
  "bg-rose-100",
  "bg-amber-100",
  "bg-sky-100",
  "bg-orange-100",
  "bg-stone-100",
  "bg-red-50",
  "bg-blue-50",
];

type Tab = "profiles" | "leaderboard" | "members" | "add-profile";

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

export default function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const { isAuthenticated, userId } = useAppSelector((s) => s.auth);

  // Stable userId from localStorage — survives SSR and hydration
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(hydrateAuth());
    setLocalUserId(localStorage.getItem("userId"));
  }, [dispatch]);

  const resolvedUserId = userId ?? localUserId;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("profiles");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add profile state
  const [profileName, setProfileName] = useState("");
  const [profileDesc, setProfileDesc] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [addingProfile, setAddingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit mode — admin can toggle to reveal remove buttons
  const [editMode, setEditMode] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<GroupProfile[]>([]);

  // Track which card has its share menu open (to elevate z-index)
  const [shareOpenFor, setShareOpenFor] = useState<string | null>(null);

  // Leave / delete group
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const isOriginalAdmin = !!(resolvedUserId && group?.createdBy?._id === resolvedUserId);
  const isAdmin = !!(resolvedUserId && (
    group?.createdBy?._id === resolvedUserId ||
    group?.admins?.some((a) => a._id === resolvedUserId)
  ));
  const isMember = group?.members?.some((m) => m._id === resolvedUserId);

  useEffect(() => {
    if (resolvedUserId !== null) fetchGroup();
  }, [id, resolvedUserId]);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await api(`/api/groups/${id}`);
      const data = await res.json();
      if (res.ok) setGroup(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api(
        `/api/groups/${id}/leaderboard`,
      );
      const data = await res.json();
      if (res.ok) setLeaderboard(data.profiles);
    } catch {
      // ignore
    }
  };

  // Shake animation: counter increments on every press, timeout clears it
  const [shakeKey, setShakeKey] = useState<Record<string, number>>({});
  const shakeTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  const triggerShake = (profileId: string) => {
    setShakeKey((prev) => ({ ...prev, [profileId]: (prev[profileId] || 0) + 1 }));
    if (shakeTimeoutRef.current[profileId]) {
      clearTimeout(shakeTimeoutRef.current[profileId]);
    }
    shakeTimeoutRef.current[profileId] = setTimeout(() => {
      setShakeKey((prev) => ({ ...prev, [profileId]: 0 }));
    }, 600);
  };

  // Track last synced counts per profile to compute deltas
  const lastSyncedRef = useRef<Record<string, { respectors: number; dispiters: number }>>({});

  const handleProfileReaction = async (
    profileId: string,
    field: "respectors" | "dispiters",
    count: number,
  ) => {
    if (!lastSyncedRef.current[profileId]) {
      const profile = group?.profiles.find((p) => p._id === profileId);
      lastSyncedRef.current[profileId] = {
        respectors: profile?.respectors ?? 0,
        dispiters: profile?.dispiters ?? 0,
      };
    }
    const delta = count - lastSyncedRef.current[profileId][field];
    lastSyncedRef.current[profileId][field] = count;
    if (delta <= 0) return;
    const type = field === "respectors" ? "respect" : "dispite";
    try {
      await api(`/api/groups/${id}/profiles/${profileId}/reactions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, count: delta }),
      });
    } catch {
      // optimistic
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const res = await api(`/api/groups/${id}/profiles/${profileId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) setGroup(data);
    } catch {
      // ignore
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await api(`/api/groups/${id}/members/${memberId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) setGroup(data);
    } catch {
      // ignore
    }
  };

  const handleDemoteAdmin = async (memberId: string) => {
    try {
      const res = await api(`/api/groups/${id}/admins/${memberId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) setGroup(data);
    } catch {
      // ignore
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      const res = await api(`/api/groups/${id}/admins/${memberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) setGroup(data);
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProfileError("");
    try {
      // Always convert through canvas to guarantee JPEG output
      // This handles HEIC, HEIF, and any other format the browser can decode
      const bitmap = await createImageBitmap(file);
      const maxDim = 1200;
      let { width, height } = bitmap;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      const blob = await canvas.convertToBlob({
        type: "image/jpeg",
        quality: 0.8,
      });

      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");
      const res = await api("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Upload failed");
        return;
      }
      setProfileImage(data.url);
    } catch {
      setProfileError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddProfile = async () => {
    if (!profileName.trim() || !profileDesc.trim() || !profileImage.trim()) {
      setProfileError("All fields are required");
      return;
    }
    setAddingProfile(true);
    setProfileError("");
    try {
      const res = await api(`/api/groups/${id}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          description: profileDesc.trim(),
          image: profileImage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to add profile");
        return;
      }
      setGroup(data);
      setProfileName("");
      setProfileDesc("");
      setProfileImage("");
      setProfileError("");
      setTab("profiles");
    } catch {
      setProfileError("Network error");
    } finally {
      setAddingProfile(false);
    }
  };

  const handleLeaveGroup = async () => {
    setLeaving(true);
    setLeaveError("");
    try {
      const res = await api(`/api/groups/${id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setLeaveError(data.error || "Failed to leave group");
        setLeaveConfirm(false);
        return;
      }
      dispatch(fetchProfile());
      window.location.href = "/";
    } catch {
      setLeaveError("Network error");
      setLeaveConfirm(false);
    } finally {
      setLeaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    setDeleting(true);
    try {
      const res = await api(`/api/groups/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        dispatch(fetchProfile());
        window.location.href = "/";
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareGroupLink = () => {
    if (!group) return;
    const url = `${window.location.origin}/join/${group.code}`;
    if (navigator.share) {
      navigator.share({
        title: `Join ${group.name} on SaluteButton`,
        text: `Vote on SaluteButton! Join my group "${group.name}"`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }
  };

  if (loading) {
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

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-5xl">😵</p>
        <p className="text-lg font-black uppercase">Group not found</p>
        <Link
          href="/"
          className="rounded-xl border-3 border-black bg-negative px-5 py-2.5 text-sm font-black uppercase text-white shadow-[4px_4px_0px_#000]"
        >
          ← Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ====== STICKY TOP BAR ====== */}
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-xl border-3 border-black bg-negative px-3 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] sm:px-5 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
            >
              ← Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            <button
              onClick={shareGroupLink}
              className="rounded-xl border-3 border-black px-3 py-2 text-xs font-black text-white shadow-[3px_3px_0px_#000] transition-all active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] sm:px-4 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
              style={{ backgroundColor: "#D6293E" }}
            >
              {copiedLink ? "Copied! ✅" : "🔗 Invite"}
            </button>
            <button
              onClick={copyCode}
              className="rounded-xl border-3 border-black bg-primary-light px-3 py-2 text-xs font-black shadow-[3px_3px_0px_#000] transition-all active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] sm:px-4 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000]"
            >
              {copied ? "Copied! ✅" : `📋 ${group.code}`}
            </button>
            <span className="rounded-xl border-3 border-black bg-white px-3 py-2 text-xs font-bold sm:px-4 sm:py-2.5 sm:text-sm">
              👥 {group.members.length}
            </span>
          </motion.div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-8 sm:px-4 sm:pb-12">
        {/* ====== GROUP NAME BANNER ====== */}
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ rotate: -2, scale: 1, opacity: 1 }}
          transition={{
            delay: 0.15,
            type: "spring" as const,
            stiffness: 150,
            damping: 12,
          }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          className="relative mt-2 mb-6 cursor-default rounded-2xl border-3 border-black bg-secondary px-6 py-5 shadow-[5px_5px_0px_#000] sm:mt-0 sm:mb-8 sm:border-4 sm:px-12 sm:py-8 sm:shadow-[8px_8px_0px_#000]"
        >
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditMode((v) => !v)}
              title={editMode ? "Exit edit mode" : "Edit group"}
              className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black text-base shadow-[2px_2px_0px_#000] transition-colors sm:top-4 sm:right-4 sm:h-10 sm:w-10 sm:text-lg ${editMode ? "bg-red-200" : "bg-white/80"}`}
            >
              {editMode ? "✕" : "✏️"}
            </motion.button>
          )}
          <h1 className="text-center text-2xl leading-tight font-black uppercase tracking-tight text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)] sm:text-5xl lg:text-6xl">
            {group.name}
          </h1>
          <p className="mt-1 text-center text-xs font-bold text-secondary-muted uppercase sm:mt-2 sm:text-sm">
            {isOriginalAdmin ? "👑 You are the Admin" : isAdmin ? "⭐ You are an Admin" : "👥 Member"} &middot;{" "}
            {group.profiles.length} profile
            {group.profiles.length !== 1 ? "s" : ""} &middot;{" "}
            {group.members.length} member
            {group.members.length !== 1 ? "s" : ""} &middot;{" "}
            {group.isPublic ? "🌍 Public" : "🔒 Private"}
          </p>
          {editMode && (
            <p className="mt-2 text-center text-[10px] font-bold uppercase text-red-200 sm:text-xs">
              ✏️ Edit mode — remove buttons visible
            </p>
          )}
        </motion.div>

        {/* ====== TAB NAVIGATION (sticky) ====== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hide-scrollbar -mx-4 mb-8 flex items-center justify-center gap-2 overflow-x-auto bg-surface-alt px-4 py-3 sm:mb-10 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:py-4"
        >
          {(
            [
              { key: "profiles", label: "🫡 Profiles", color: "bg-positive" },
              { key: "leaderboard", label: "🏆 Leaderboard", color: "bg-primary" },
              { key: "members", label: "👥 Members", color: "bg-secondary-light" },
            ] as const
          ).map((t, i) => (
            <motion.button
              key={t.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setTab(t.key);
                if (t.key === "leaderboard") fetchLeaderboard();
              }}
              className={`shrink-0 rounded-xl border-3 border-black px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_#000] transition-shadow sm:px-6 sm:py-2.5 sm:text-sm sm:shadow-[4px_4px_0px_#000] ${
                tab === t.key
                  ? `${t.color} text-black`
                  : "bg-white text-black"
              }`}
            >
              {t.label}
            </motion.button>
          ))}

        </motion.div>

        {/* ====== TAB CONTENT ====== */}
        <AnimatePresence mode="wait">
          {/* --- PROFILES TAB --- */}
          {tab === "profiles" && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {group.profiles.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" as const, stiffness: 200 }}
                    className="text-6xl sm:text-7xl"
                  >
                    📭
                  </motion.p>
                  <p className="mt-4 text-lg font-black uppercase sm:text-xl">
                    No profiles yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500 sm:text-base">
                    {isAdmin
                      ? "Add the first profile to get started!"
                      : "Ask the admin to add some profiles."}
                  </p>
                  {isAdmin && (group.profiles?.length || 0) < 10 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTab("add-profile");
                        setProfileName("");
                        setProfileDesc("");
                        setProfileImage("");
                        setProfileError("");
                      }}
                      className="mt-6 rounded-xl border-3 border-black bg-secondary px-8 py-4 text-base font-black uppercase text-white shadow-[5px_5px_0px_#000] transition-shadow hover:shadow-[8px_8px_0px_#000] sm:px-10 sm:py-5 sm:text-lg"
                    >
                      ➕ Add First Profile
                    </motion.button>
                  )}
                </div>
              ) : (
                <>
                {/* Add More button above the grid */}
                {isAdmin && group.profiles.length < 10 && (
                  <div className="mb-8 flex justify-center sm:mb-10">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setTab("add-profile");
                        setProfileName("");
                        setProfileDesc("");
                        setProfileImage("");
                        setProfileError("");
                      }}
                      className="rounded-xl border-3 border-black bg-secondary px-8 py-3.5 text-sm font-black uppercase text-white shadow-[5px_5px_0px_#000] transition-shadow hover:shadow-[8px_8px_0px_#000] sm:px-10 sm:py-4 sm:text-base"
                    >
                      ➕ Add More Profiles ({group.profiles.length}/10)
                    </motion.button>
                  </div>
                )}
                <div className="mx-auto mt-[50px] grid max-w-lg grid-cols-2 gap-x-4 gap-y-12 sm:mt-8 sm:max-w-none sm:grid-cols-3 sm:gap-x-5 sm:gap-y-16 lg:grid-cols-4">
                  {group.profiles.map((p, i) => (
                    <div key={p._id} className={shareOpenFor === p._id ? "relative z-50" : "relative"}>
                    <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotate: TILTS[i % TILTS.length],
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.04,
                        type: "spring" as const,
                        stiffness: 180,
                        damping: 18,
                      }}
                      whileHover={{ rotate: 0, y: -8, scale: 1.04 }}
                      className={`neo-brutal relative flex flex-col items-center bg-white px-3 pb-4 pt-12 sm:px-6 sm:pb-6 sm:pt-20 ${shakeKey[p._id] ? "animate-card-shake" : ""}`}
                      style={shakeKey[p._id] ? { animationIterationCount: "infinite" } : undefined}
                    >
                      {/* Share button — same position/style as person-card */}
                      <ShareButton
                        celebId={p._id}
                        celebName={p.name}
                        respectors={p.respectors}
                        className="absolute top-2 right-2 z-10 sm:top-3 sm:right-3"
                        onToggle={(open) => setShareOpenFor(open ? p._id : null)}
                        customShareUrl={`${window.location.origin}/join/${group.code}?profile=${p._id}`}
                        customShareText={`"${p.name}" — ${p.description.slice(0, 80)}${p.description.length > 80 ? "..." : ""}\nVote in "${group.name}" on SaluteButton! 🫡`}
                        customShareTitle={`${p.name} on SaluteButton`}
                      />

                      {/* Circular image */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{
                          type: "spring" as const,
                          stiffness: 300,
                        }}
                        className="absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 overflow-hidden rounded-full border-3 border-black bg-gray-200 shadow-[3px_3px_0px_#000] sm:-top-14 sm:h-28 sm:w-28 sm:border-4 sm:shadow-[4px_4px_0px_#000]"
                      >
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 64px, 112px"
                          unoptimized
                        />
                      </motion.div>

                      {/* Name */}
                      <h3 className="mt-1 text-center text-sm font-black uppercase leading-tight tracking-tight sm:mt-2 sm:text-xl">
                        {p.name}
                      </h3>

                      {/* Separator */}
                      <div className="my-2 w-full border-t-2 border-dashed border-gray-300 sm:my-3" />

                      {/* Description */}
                      <p className="mb-2 line-clamp-2 text-center text-[10px] italic text-gray-500 sm:mb-3 sm:text-sm">
                        &ldquo;{p.description}&rdquo;
                      </p>

                      {/* Buttons */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <SaluteButton
                          initialCount={p.respectors}
                          onSalute={(count) =>
                            handleProfileReaction(p._id, "respectors", count)
                          }
                          onPress={() => triggerShake(p._id)}
                        />
                        <DisrespectButton
                          initialCount={p.dispiters}
                          onDisrespect={(count) =>
                            handleProfileReaction(p._id, "dispiters", count)
                          }
                          onPress={() => triggerShake(p._id)}
                        />
                      </div>

                      {/* Admin delete — only visible in edit mode */}
                      {isAdmin && editMode && (
                        <button
                          onClick={() => handleDeleteProfile(p._id)}
                          className="mt-2.5 rounded-lg border-2 border-black bg-red-100 px-3 py-1 text-[10px] font-bold text-red-600 shadow-[2px_2px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000] sm:text-xs"
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </motion.div>
                    </div>
                  ))}
                </div>

                </>
              )}
            </motion.div>
          )}

          {/* --- LEADERBOARD TAB --- */}
          {tab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Leaderboard title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring" as const, stiffness: 200 }}
                className="mb-5 flex flex-col items-center pt-1 sm:mb-8 sm:pt-2"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 2 }}
                  className="text-4xl sm:text-6xl"
                >
                  🏆
                </motion.span>
                <h2 className="mt-1 text-center text-3xl font-black uppercase tracking-tight sm:text-5xl">
                  <span className="text-primary">Leader</span>board
                </h2>
              </motion.div>

              {leaderboard.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-5xl">📭</p>
                  <p className="mt-3 text-lg font-black uppercase">
                    No profiles to rank yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:gap-6">
                  {leaderboard.map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: i * 0.03,
                        type: "spring" as const,
                        stiffness: 200,
                        damping: 20,
                      }}
                      whileHover={{ x: 6, scale: 1.01 }}
                      className={`flex items-center gap-2 rounded-xl border-3 border-black px-4 py-4 shadow-[3px_3px_0px_#000] transition-shadow hover:shadow-[8px_8px_0px_#000] sm:gap-4 sm:rounded-2xl sm:border-4 sm:px-8 sm:py-6 sm:shadow-[6px_6px_0px_#000] ${
                        ROW_COLORS[i % ROW_COLORS.length]
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-black text-white sm:h-12 sm:w-12 sm:text-lg">
                        #{i + 1}
                      </div>

                      {/* Image */}
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-black shadow-[2px_2px_0px_#000] sm:h-16 sm:w-16 sm:border-3 sm:shadow-[3px_3px_0px_#000]">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xs font-black uppercase sm:text-xl">
                          {p.name}
                        </h3>
                        <p className="hidden truncate text-xs italic text-gray-600 sm:block">
                          {p.description}
                        </p>
                      </div>

                      {/* Score pills */}
                      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-0.5 rounded-lg border-2 border-black bg-positive px-2 py-1 font-black shadow-[2px_2px_0px_#000] sm:gap-1 sm:rounded-xl sm:border-3 sm:px-4 sm:py-2 sm:shadow-[3px_3px_0px_#000]"
                        >
                          <span className="text-sm sm:text-lg">🫡</span>
                          <span className="text-xs tabular-nums sm:text-base">
                            {formatCount(p.respectors)}
                          </span>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-0.5 rounded-lg border-2 border-black bg-primary px-2 py-1 font-black text-white shadow-[2px_2px_0px_#000] sm:gap-1 sm:rounded-xl sm:border-3 sm:px-4 sm:py-2 sm:shadow-[3px_3px_0px_#000]"
                        >
                          <span className="text-sm sm:text-lg">😤</span>
                          <span className="text-xs tabular-nums sm:text-base">
                            {formatCount(p.dispiters)}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* --- MEMBERS TAB --- */}
          {tab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2.5 sm:gap-3"
            >
              {group.members.map((m, i) => {
                const isOwner = m._id === group.createdBy._id;
                const isPromotedAdmin = !isOwner && group.admins?.some((a) => a._id === m._id);
                const isSelf = m._id === resolvedUserId;
                // Can this member be removed? Any admin can remove non-owner, non-self members;
                // but only original admin can remove promoted admins.
                const canRemove = isAdmin && !isOwner && !isSelf && (
                  !isPromotedAdmin || isOriginalAdmin
                );
                // Can this member be promoted? Any admin can promote regular (non-admin) members.
                const canPromote = isAdmin && !isOwner && !isPromotedAdmin && !isSelf;
                // Can this admin be demoted? Only the original creator can demote promoted admins.
                const canDemote = isOriginalAdmin && isPromotedAdmin;
                return (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 rounded-xl border-3 border-black bg-white px-4 py-3 shadow-[3px_3px_0px_#000] sm:rounded-2xl sm:border-4 sm:px-6 sm:py-4 sm:shadow-[4px_4px_0px_#000]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-secondary-muted text-xl sm:h-14 sm:w-14 sm:border-3 sm:text-2xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black uppercase sm:text-lg">
                        {m.username}
                      </p>
                    </div>
                    {isOwner && (
                      <span className="rounded-lg border-2 border-black bg-accent px-2.5 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] sm:px-3 sm:text-xs">
                        👑 Admin
                      </span>
                    )}
                    {isPromotedAdmin && (
                      <span className="rounded-lg border-2 border-black bg-primary-light px-2.5 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] sm:px-3 sm:text-xs">
                        ⭐ Admin
                      </span>
                    )}
                    {canPromote && (
                      <button
                        onClick={() => handlePromoteToAdmin(m._id)}
                        className="rounded-lg border-2 border-black bg-yellow-100 px-2.5 py-1 text-[10px] font-bold text-yellow-700 shadow-[2px_2px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000] sm:text-xs"
                      >
                        ⭐ Make Admin
                      </button>
                    )}
                    {canDemote && editMode && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => handleDemoteAdmin(m._id)}
                        className="rounded-lg border-2 border-black bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-600 shadow-[2px_2px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000] sm:text-xs"
                      >
                        ↓ Remove Admin
                      </motion.button>
                    )}
                    {canRemove && editMode && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => handleRemoveMember(m._id)}
                        className="rounded-lg border-2 border-black bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-600 shadow-[2px_2px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000] sm:text-xs"
                      >
                        🚫 Remove
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}

              {/* Danger Zone */}
              <div className="mt-6 border-t-2 border-dashed border-gray-200 pt-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Danger Zone
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setLeaveError(""); setLeaveConfirm(true); }}
                    className="rounded-xl border-3 border-black bg-orange-100 px-4 py-2.5 text-xs font-black uppercase text-orange-700 shadow-[3px_3px_0px_#000] transition-all hover:bg-orange-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:px-5 sm:text-sm"
                  >
                    🚪 Leave Group
                  </motion.button>
                  {isOriginalAdmin && editMode && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDeleteConfirm(true)}
                      className="rounded-xl border-3 border-black bg-red-100 px-4 py-2.5 text-xs font-black uppercase text-red-700 shadow-[3px_3px_0px_#000] transition-all hover:bg-red-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:px-5 sm:text-sm"
                    >
                      🗑️ Delete Group
                    </motion.button>
                  )}
                </div>
                {leaveError && (
                  <p className="mt-3 text-xs font-bold text-red-500 sm:text-sm">{leaveError}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* --- ADD PROFILE TAB (admin only) --- */}
          {tab === "add-profile" && isAdmin && (
            <motion.div
              key="add-profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-auto max-w-md"
            >
              <div className="neo-brutal bg-white p-5 sm:p-8">
                <h2 className="mb-5 text-xl font-black uppercase sm:text-2xl">
                  ➕ Add New Profile
                </h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-gray-400">
                      Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-lg border-3 border-black px-4 py-2.5 text-sm font-semibold outline-none shadow-[3px_3px_0px_#000] focus:shadow-[5px_5px_0px_#000] sm:text-base"
                      maxLength={40}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-gray-400">
                      Description *
                    </label>
                    <textarea
                      placeholder="A short bio or description..."
                      value={profileDesc}
                      onChange={(e) => setProfileDesc(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border-3 border-black px-4 py-2.5 text-sm font-semibold outline-none shadow-[3px_3px_0px_#000] focus:shadow-[5px_5px_0px_#000] sm:text-base"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-gray-400">
                      Photo *
                    </label>

                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="mb-2 w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-sm font-black uppercase shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50 sm:text-base"
                    >
                      {uploading
                        ? "Uploading..."
                        : "📷 Upload from Gallery"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* OR divider */}
                    <div className="my-2 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-300" />
                      <span className="text-xs font-bold text-gray-400">
                        OR
                      </span>
                      <div className="h-px flex-1 bg-gray-300" />
                    </div>

                    {/* URL input */}
                    <input
                      type="url"
                      placeholder="Paste image URL"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      className="w-full rounded-lg border-3 border-black px-4 py-2.5 text-sm font-semibold outline-none shadow-[3px_3px_0px_#000] focus:shadow-[5px_5px_0px_#000] sm:text-base"
                    />
                  </div>

                  {/* Preview */}
                  {profileImage.trim() && (
                    <div className="flex justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="relative h-24 w-24 overflow-hidden rounded-full border-3 border-black bg-gray-200 shadow-[4px_4px_0px_#000] sm:h-32 sm:w-32 sm:border-4"
                      >
                        <Image
                          src={profileImage.trim()}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="128px"
                          unoptimized
                        />
                      </motion.div>
                    </div>
                  )}

                  {profileError && (
                    <p className="text-sm font-bold text-red-500">
                      {profileError}
                    </p>
                  )}

                  <button
                    onClick={handleAddProfile}
                    disabled={
                      !profileName.trim() ||
                      !profileDesc.trim() ||
                      !profileImage.trim() ||
                      addingProfile
                    }
                    className="w-full rounded-xl border-3 border-black bg-secondary px-5 py-3.5 text-base font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50 sm:text-lg"
                  >
                    {addingProfile ? "Adding..." : "➕ Add Profile"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* ====== LEAVE GROUP CONFIRM MODAL ====== */}
      <AnimatePresence>
        {leaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
            onClick={() => !leaving && setLeaveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] sm:p-8"
            >
              <p className="mb-2 text-4xl text-center sm:text-5xl">🚪</p>
              <h2 className="mb-2 text-center text-xl font-black uppercase sm:text-2xl">
                Leave Group?
              </h2>

              {isOriginalAdmin && group.admins.length === 0 ? (
                <>
                  <p className="mb-5 text-center text-sm text-gray-600 sm:text-base">
                    You're the only admin. <strong>Promote a member to admin</strong> first, or delete the group.
                  </p>
                  <button
                    onClick={() => setLeaveConfirm(false)}
                    className="w-full rounded-xl border-3 border-black bg-secondary px-5 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    Got it
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-5 text-center text-sm text-gray-600 sm:text-base">
                    {isOriginalAdmin
                      ? <>Ownership will transfer to <strong>{group.admins[0]?.username}</strong>. You'll be removed from the group.</>
                      : <>You'll be removed from <strong>{group.name}</strong>. You'll need an invite code to rejoin.</>
                    }
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLeaveConfirm(false)}
                      disabled={leaving}
                      className="flex-1 rounded-xl border-3 border-black bg-white px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0px_#000] transition-all hover:bg-gray-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLeaveGroup}
                      disabled={leaving}
                      className="flex-1 rounded-xl border-3 border-black bg-orange-400 px-4 py-3 text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:bg-orange-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                    >
                      {leaving ? "Leaving..." : "Leave"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== DELETE GROUP CONFIRM MODAL ====== */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
            onClick={() => !deleting && setDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] sm:p-8"
            >
              <p className="mb-2 text-4xl text-center sm:text-5xl">🗑️</p>
              <h2 className="mb-2 text-center text-xl font-black uppercase sm:text-2xl">
                Delete Group?
              </h2>
              <p className="mb-5 text-center text-sm text-gray-600 sm:text-base">
                <strong>{group.name}</strong> and all its profiles will be permanently deleted. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border-3 border-black bg-white px-4 py-3 text-sm font-black uppercase shadow-[3px_3px_0px_#000] transition-all hover:bg-gray-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteGroup}
                  disabled={deleting}
                  className="flex-1 rounded-xl border-3 border-black bg-red-500 px-4 py-3 text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:bg-red-600 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
