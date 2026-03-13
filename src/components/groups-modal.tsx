"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { api } from "@/lib/api";
import type { Group } from "@/types";

interface GroupsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

type View = "menu" | "create" | "join" | "my-groups";

export function GroupsModal({ open, onClose, onOpenLogin }: GroupsModalProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("menu");
  const { isAuthenticated, userId } = useAppSelector((s) => s.auth);

  // Create group state
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);
  const [createError, setCreateError] = useState("");

  // Join group state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinedGroup, setJoinedGroup] = useState<Group | null>(null);

  // My groups state
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView("menu");
        setGroupName("");
        setCreating(false);
        setCreatedGroup(null);
        setCreateError("");
        setJoinCode("");
        setJoining(false);
        setJoinError("");
        setJoinedGroup(null);
        setCopied(false);
      }, 200);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await api("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create group");
        return;
      }
      setCreatedGroup(data);
    } catch {
      setCreateError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError("");
    try {
      const res = await api("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Could not join group");
        return;
      }
      setJoinedGroup(data);
    } catch {
      setJoinError("Network error");
    } finally {
      setJoining(false);
    }
  };

  const fetchMyGroups = async () => {
    setLoadingGroups(true);
    try {
      const res = await api("/api/groups/my");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setMyGroups(data);
    } catch {
      // ignore
    } finally {
      setLoadingGroups(false);
    }
  };

  const openGroup = (groupId: string) => {
    onClose();
    router.push(`/group/${groupId}`);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLoginClick = () => {
    onClose();
    setTimeout(() => onOpenLogin(), 200);
  };

  const renderAuthGate = (action: string) => (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full rounded-2xl border-3 border-black bg-amber-50 p-6 text-center shadow-[4px_4px_0px_#000]">
        <p className="text-5xl">👮</p>
        <p className="mt-3 text-xl font-black uppercase">Hold up, bro!</p>
        <p className="mt-1.5 text-sm font-semibold text-gray-500">
          You need to be logged in to {action}.
        </p>
        <button
          onClick={handleLoginClick}
          className="mt-5 w-full rounded-xl border-3 border-black bg-emerald-400 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-emerald-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
        >
          🔓 LOGIN NOW
        </button>
      </div>
    </div>
  );

  const renderHeader = (title: string, onBack: () => void) => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-3 border-black bg-white text-sm font-black shadow-[3px_3px_0px_#000] transition-all hover:bg-gray-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000]"
          >
            ←
          </button>
          <h2 className="text-xl font-black uppercase sm:text-2xl">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border-3 border-black bg-red-500 text-lg font-black text-white shadow-[2px_2px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000]"
        >
          ✕
        </button>
      </div>
      <div className="my-4 border-t-3 border-black" />
    </>
  );

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
            className="w-full max-w-sm rounded-3xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000]"
          >
            <AnimatePresence mode="wait">
              {/* ====== MAIN MENU ====== */}
              {view === "menu" && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase">
                      GROUPS 👥
                    </h2>
                    <button
                      onClick={onClose}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-3 border-black bg-red-500 text-lg font-black text-white shadow-[2px_2px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="my-4 border-t-3 border-black" />

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setView("create")}
                      className="w-full rounded-xl border-3 border-black bg-amber-300 px-5 py-4 text-lg font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                    >
                      ⛏️ Create a Group
                    </button>
                    <button
                      onClick={() => setView("join")}
                      className="w-full rounded-xl border-3 border-black bg-purple-300 px-5 py-4 text-lg font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                    >
                      🤝 Join a Group
                    </button>
                    <button
                      onClick={() => {
                        setView("my-groups");
                        if (isAuthenticated) fetchMyGroups();
                      }}
                      className="w-full rounded-xl border-3 border-black bg-sky-300 px-5 py-4 text-lg font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:shadow-[6px_6px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                    >
                      🔍 My Groups
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ====== CREATE GROUP ====== */}
              {view === "create" && (
                <motion.div
                  key="create"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderHeader("Create Group", () => {
                    setView("menu");
                    setCreatedGroup(null);
                    setCreateError("");
                  })}

                  {!isAuthenticated ? (
                    renderAuthGate("create a group")
                  ) : createdGroup ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full rounded-2xl border-3 border-black bg-emerald-50 p-5 text-center shadow-[4px_4px_0px_#000]">
                        <p className="text-4xl">🎉</p>
                        <p className="mt-2 text-lg font-black uppercase">
                          Group Created!
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-600">
                          Share this code with your friends:
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <span className="rounded-xl border-3 border-black bg-amber-100 px-4 py-2 text-2xl font-black tracking-widest">
                            {createdGroup.code}
                          </span>
                          <button
                            onClick={() => copyCode(createdGroup.code)}
                            className="rounded-xl border-3 border-black bg-amber-300 px-3 py-2 text-sm font-bold shadow-[3px_3px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000]"
                          >
                            {copied ? "✅" : "📋"}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => openGroup(createdGroup._id)}
                        className="w-full rounded-xl border-3 border-black bg-purple-400 px-5 py-3.5 text-base font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                      >
                        🚀 Enter Group
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          GROUP NAME
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. The Squad"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="w-full rounded-xl border-3 border-black bg-amber-100 px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                          maxLength={30}
                        />
                      </div>
                      {createError && (
                        <p className="text-sm font-bold text-red-500">
                          {createError}
                        </p>
                      )}
                      <button
                        onClick={handleCreate}
                        disabled={!groupName.trim() || creating}
                        className="w-full rounded-xl border-3 border-black bg-amber-300 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-amber-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50"
                      >
                        {creating ? "Creating..." : "⛏️ Create Group"}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ====== JOIN GROUP ====== */}
              {view === "join" && (
                <motion.div
                  key="join"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderHeader("Join Group", () => {
                    setView("menu");
                    setJoinedGroup(null);
                    setJoinError("");
                  })}

                  {!isAuthenticated ? (
                    renderAuthGate("join a group")
                  ) : joinedGroup ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-full rounded-2xl border-3 border-black bg-purple-50 p-5 text-center shadow-[4px_4px_0px_#000]">
                        <p className="text-4xl">🤝</p>
                        <p className="mt-2 text-lg font-black uppercase">
                          You&apos;re in!
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-600">
                          Welcome to &quot;{joinedGroup.name}&quot;
                        </p>
                      </div>
                      <button
                        onClick={() => openGroup(joinedGroup._id)}
                        className="w-full rounded-xl border-3 border-black bg-purple-400 px-5 py-3.5 text-base font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                      >
                        🚀 Enter Group
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          GROUP CODE
                        </label>
                        <input
                          type="text"
                          placeholder="Enter code"
                          value={joinCode}
                          onChange={(e) =>
                            setJoinCode(e.target.value.toUpperCase())
                          }
                          className="w-full rounded-xl border-3 border-black bg-amber-100 px-4 py-3 text-center text-lg font-black tracking-widest uppercase outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                          maxLength={6}
                        />
                      </div>
                      {joinError && (
                        <p className="text-sm font-bold text-red-500">
                          {joinError}
                        </p>
                      )}
                      <button
                        onClick={handleJoin}
                        disabled={!joinCode.trim() || joining}
                        className="w-full rounded-xl border-3 border-black bg-purple-300 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-purple-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50"
                      >
                        {joining ? "Joining..." : "🤝 Join Group"}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ====== MY GROUPS ====== */}
              {view === "my-groups" && (
                <motion.div
                  key="my-groups"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {renderHeader("My Groups", () => setView("menu"))}

                  {!isAuthenticated ? (
                    renderAuthGate("view your groups")
                  ) : loadingGroups ? (
                    <div className="py-8 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          ease: "linear",
                        }}
                        className="mx-auto h-10 w-10 rounded-full border-4 border-black border-t-transparent"
                      />
                      <p className="mt-3 text-sm font-bold text-gray-500">
                        Loading...
                      </p>
                    </div>
                  ) : myGroups.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-5xl">😢</p>
                      <p className="mt-3 text-base font-black uppercase text-gray-400">
                        No groups yet
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-400">
                        Create or join a group to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
                      {myGroups.map((g, i) => (
                        <motion.button
                          key={g._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => openGroup(g._id)}
                          className="flex items-center justify-between rounded-xl border-3 border-black bg-white px-4 py-3 text-left shadow-[3px_3px_0px_#000] transition-all hover:shadow-[5px_5px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                        >
                          <div>
                            <p className="text-sm font-black uppercase">
                              {g.name}
                            </p>
                            <p className="text-xs font-semibold text-gray-400">
                              {g.members.length} member
                              {g.members.length !== 1 ? "s" : ""} &middot;{" "}
                              {g.profiles?.length || 0} profile
                              {(g.profiles?.length || 0) !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <span className="rounded-lg border-2 border-black bg-amber-200 px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_#000]">
                            {g.code}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
