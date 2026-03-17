"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/auth-slice";
import { api } from "@/lib/api";
import { LoginModal } from "@/components/login-modal";
import { SaluteButton } from "@/components/salute-button";
import { DisrespectButton } from "@/components/disrespect-button";

type ProfilePreview = {
  _id: string;
  name: string;
  description: string;
  image: string;
  respectors: number;
  dispiters: number;
};

type GroupPreviewData = {
  _id: string;
  name: string;
  code: string;
  memberCount: number;
  profileCount: number;
  createdBy: string;
  profile?: ProfilePreview;
};

type FullGroupData = {
  _id: string;
  name: string;
  code: string;
  members: { _id: string; username: string }[];
  profiles: ProfilePreview[];
};

interface JoinGroupPageClientProps {
  code: string;
  profileId?: string;
  initialPreview: GroupPreviewData | null;
}

export function JoinGroupPageClient({ code, profileId, initialPreview }: JoinGroupPageClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [preview] = useState<GroupPreviewData | null>(initialPreview);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pendingJoinRef = useRef(false);

  // Full group data (fetched when user is a member to allow voting)
  const [groupData, setGroupData] = useState<FullGroupData | null>(null);
  const [checkingMembership, setCheckingMembership] = useState(false);

  // Track reaction counts locally for optimistic updates
  const [profileCounts, setProfileCounts] = useState<{
    respectors: number;
    dispiters: number;
  } | null>(null);
  const lastSyncedRef = useRef<{ respectors: number; dispiters: number } | null>(null);

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  // When authenticated, check if already a member
  useEffect(() => {
    if (!isAuthenticated || !preview?._id) return;
    if (alreadyMember || groupData) return;

    const checkMembership = async () => {
      setCheckingMembership(true);
      let isMember = false;
      try {
        const res = await api(`/api/groups/${preview._id}`);
        if (res.ok) {
          const data = await res.json();
          setGroupData(data);
          setAlreadyMember(true);
          isMember = true;
          // Init profile counts from full group data
          if (profileId) {
            const found = data.profiles.find((p: ProfilePreview) => p._id === profileId);
            if (found) {
              setProfileCounts({ respectors: found.respectors, dispiters: found.dispiters });
              lastSyncedRef.current = { respectors: found.respectors, dispiters: found.dispiters };
            }
          }
        }
      } catch {
        // Not a member or error — that's fine
      } finally {
        setCheckingMembership(false);
        // If there's a pending join triggered from the "login to join" button and user wasn't already a member
        if (pendingJoinRef.current && !isMember) {
          pendingJoinRef.current = false;
          handleJoin();
        }
      }
    };
    checkMembership();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, preview?._id]);

  const handleJoin = async () => {
    if (!preview) return;
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
          router.push(`/group/${preview._id}`);
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

  const handleLoginSuccess = () => {
    // After login, if user clicked "Login to Join", auto-trigger join
    if (pendingJoinRef.current) {
      pendingJoinRef.current = false;
      // Small delay to let auth state propagate
      setTimeout(handleJoin, 300);
    }
  };

  const handleReaction = async (field: "respectors" | "dispiters", newCount: number) => {
    if (!preview || !profileId) return;
    const synced = lastSyncedRef.current ?? { respectors: 0, dispiters: 0 };
    const delta = newCount - synced[field];
    lastSyncedRef.current = { ...synced, [field]: newCount };
    if (delta <= 0) return;
    const type = field === "respectors" ? "respect" : "dispite";
    try {
      await api(`/api/groups/${preview._id}/profiles/${profileId}/reactions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, count: delta }),
      });
    } catch {
      // optimistic — ignore
    }
  };

  if (!preview) {
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

  const sharedProfile = profileId
    ? (groupData?.profiles.find((p) => p._id === profileId) ?? preview.profile)
    : undefined;

  const displayCounts = profileCounts ?? (sharedProfile
    ? { respectors: sharedProfile.respectors, dispiters: sharedProfile.dispiters }
    : null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Profile preview card (if shared with a profile) */}
      {sharedProfile && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="neo-brutal mb-6 w-full max-w-xs bg-white px-6 pb-6 pt-14 text-center"
          style={{ position: "relative" }}
        >
          {/* Circular image */}
          <div className="absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 overflow-hidden rounded-full border-4 border-black bg-gray-200 shadow-[4px_4px_0px_#000]">
            <Image
              src={sharedProfile.image}
              alt={sharedProfile.name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          </div>

          <h2 className="text-xl font-black uppercase leading-tight">{sharedProfile.name}</h2>
          <div className="my-2 w-full border-t-2 border-dashed border-gray-300" />
          <p className="mb-4 text-sm italic text-gray-500">&ldquo;{sharedProfile.description}&rdquo;</p>

          {alreadyMember && displayCounts ? (
            <>
              <div className="flex items-center justify-center gap-3">
                <SaluteButton
                  initialCount={displayCounts.respectors}
                  onSalute={(count) => {
                    setProfileCounts((prev) => ({ ...(prev ?? displayCounts), respectors: count }));
                    handleReaction("respectors", count);
                  }}
                />
                <DisrespectButton
                  initialCount={displayCounts.dispiters}
                  onDisrespect={(count) => {
                    setProfileCounts((prev) => ({ ...(prev ?? displayCounts), dispiters: count }));
                    handleReaction("dispiters", count);
                  }}
                />
              </div>
              <Link
                href={`/group/${preview._id}`}
                className="mt-4 block w-full rounded-xl border-3 border-black bg-secondary px-5 py-2.5 text-sm font-black uppercase text-white shadow-[3px_3px_0px_#000] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000]"
              >
                👥 Go to Group
              </Link>
            </>
          ) : (
            <p className="text-xs font-bold text-gray-400 uppercase">
              {isAuthenticated ? (checkingMembership ? "Checking membership..." : "Join this group to vote!") : "Join or login to vote!"}
            </p>
          )}
        </motion.div>
      )}

      {/* Group join card */}
      {!alreadyMember && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18, delay: sharedProfile ? 0.1 : 0 }}
          className="neo-brutal w-full max-w-sm bg-white px-8 py-10 text-center"
        >
          {!sharedProfile && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-4 text-5xl"
            >
              🫡
            </motion.div>
          )}

          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-gray-400">
            {sharedProfile ? `Vote in group` : `You're invited to join`}
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
                  disabled={joining}
                  className="w-full rounded-xl border-3 border-black py-3.5 text-base font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000] disabled:opacity-60"
                  style={{ backgroundColor: "#D6293E" }}
                >
                  {joining ? "Joining..." : "🫡 Join Group"}
                </motion.button>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm font-bold text-gray-500">
                  Login to join and vote
                </p>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    pendingJoinRef.current = true;
                    setLoginOpen(true);
                  }}
                  className="w-full rounded-xl border-3 border-black py-3.5 text-base font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000]"
                  style={{ backgroundColor: "#D6293E" }}
                >
                  🔐 Login to Join
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      )}

      <Link
        href="/"
        className="mt-6 text-xs font-bold uppercase text-gray-400 underline hover:text-black"
      >
        Go to SaluteButton
      </Link>

      {/* Inline login modal — stays on this page, auto-joins after login */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
