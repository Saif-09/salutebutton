"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuth, logout } from "@/store/slices/auth-slice";
import { api } from "@/lib/api";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type View = "join" | "login" | "forgot" | "forgot-answer";

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [view, setView] = useState<View>("login");

  // Join (signup) state
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginCode, setLoginCode] = useState("");

  // Forgot code state
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotQuestion, setForgotQuestion] = useState("");

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Secret code reveal after signup or reset
  const [secretCode, setSecretCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Login success popup
  const [loginSuccess, setLoginSuccess] = useState(false);

  const SECURITY_QUESTIONS = [
    "What is your pet's name?",
    "What city were you born in?",
    "What is your favorite movie?",
    "What is your mother's maiden name?",
    "What was your first school's name?",
    "What is your favorite food?",
  ];

  const dispatch = useAppDispatch();
  const { isAuthenticated, username: currentUser } = useAppSelector(
    (s) => s.auth,
  );

  const resetForm = () => {
    setUsername("");
    setPhone("");
    setSecurityQuestion("");
    setSecurityAnswer("");
    setLoginPhone("");
    setLoginCode("");
    setForgotPhone("");
    setForgotAnswer("");
    setForgotQuestion("");
    setError("");
    setSecretCode(null);
    setCopied(false);
    setLoginSuccess(false);
    setView("login");
  };

  const handleJoin = async () => {
    if (!username.trim() || !phone.trim()) {
      setError("Both fields are required");
      return;
    }
    if (!securityQuestion || !securityAnswer.trim()) {
      setError("Security question and answer are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          phone: phone.trim(),
          securityQuestion,
          securityAnswer: securityAnswer.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);

      dispatch(
        setAuth({
          token: data.token,
          userId: data.userId,
          username: data.username,
        }),
      );

      setSecretCode(data.secretCode);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginPhone.trim() || !loginCode.trim()) {
      setError("Phone and secret code are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: loginPhone.trim(),
          passcode: loginCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("username", data.username);

      dispatch(
        setAuth({
          token: data.token,
          userId: data.userId,
          username: data.username,
        }),
      );

      setLoginSuccess(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    dispatch(logout());
    resetForm();
    onClose();
  };

  // Step 1: Enter phone, get security question back
  const handleForgotLookup = async () => {
    if (!forgotPhone.trim()) {
      setError("Phone number is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // We send a dummy answer to get the error or question
      // Instead, let's just proceed to answer step — the user picks from the same questions
      // Actually, we need to know which question to ask. Let's add a lookup step.
      const res = await api("/api/users/forgot-passcode/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setForgotQuestion(data.securityQuestion);
      setView("forgot-answer");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Answer security question, get new code
  const handleForgotReset = async () => {
    if (!forgotAnswer.trim()) {
      setError("Please answer the security question");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api("/api/users/forgot-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: forgotPhone.trim(),
          securityAnswer: forgotAnswer.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid answer");
        return;
      }

      setSecretCode(data.secretCode);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (secretCode) {
      navigator.clipboard.writeText(secretCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDone = () => {
    resetForm();
    onClose();
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
            className="w-full max-w-sm rounded-3xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_#000]"
          >
            {/* ====== LOGIN SUCCESS VIEW ====== */}
            {loginSuccess ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-full rounded-xl border-3 border-black bg-surface-alt p-5 text-center shadow-[4px_4px_0px_#000]">
                  <p className="text-4xl">🎉</p>
                  <p className="mt-2 text-lg font-black uppercase">
                    Login Successful!
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-600">
                    Welcome back, {currentUser}!
                  </p>

                  <div className="mt-4 flex flex-col gap-2 text-left">
                    <p className="text-xs font-bold uppercase text-gray-400">
                      You can now use:
                    </p>
                    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                      <span className="text-lg">🫡</span>
                      <span className="text-sm font-bold">
                        Salute & Disrespect celebs
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                      <span className="text-lg">👥</span>
                      <span className="text-sm font-bold">
                        Create & Join groups
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                      <span className="text-lg">💬</span>
                      <span className="text-sm font-bold">
                        Send feedback & suggestions
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDone}
                  className="w-full rounded-xl border-3 border-black bg-gray-200 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                >
                  🚀 LET&apos;S GO
                </button>
              </div>
            ) : /* ====== LOGGED IN VIEW ====== */
            isAuthenticated && !secretCode ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <p className="text-4xl">👤</p>
                <p className="text-lg font-bold">Hey, {currentUser}!</p>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border-3 border-black bg-negative px-6 py-2.5 text-sm font-black uppercase text-white shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                >
                  Logout
                </button>
              </div>
            ) : secretCode ? (
              /* ====== SECRET CODE REVEAL ====== */
              <div className="flex flex-col items-center gap-3">
                <div className="w-full rounded-xl border-3 border-black bg-surface-alt p-5 text-center shadow-[4px_4px_0px_#000]">
                  <p className="text-4xl">🔑</p>
                  <p className="mt-2 text-lg font-black uppercase">
                    Your Secret Code
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    Save this! You&apos;ll need it to login. It won&apos;t be
                    shown again.
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-3xl font-black tracking-[0.3em]">
                      {secretCode}
                    </span>
                    <button
                      onClick={copyCode}
                      className="rounded-xl border-3 border-black bg-primary-light px-3 py-3 text-sm font-bold shadow-[3px_3px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000]"
                    >
                      {copied ? "✅" : "📋"}
                    </button>
                  </div>

                  <div className="mt-3 rounded-lg bg-red-100 px-3 py-2">
                    <p className="text-xs font-bold text-red-600">
                      ⚠️ Screenshot this or write it down. This code is your
                      password!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDone}
                  className="w-full rounded-xl border-3 border-black bg-gray-200 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000]"
                >
                  I&apos;VE SAVED IT ✅
                </button>
              </div>
            ) : (
              /* ====== JOIN / LOGIN / FORGOT FORM ====== */
              <>
                {/* Header with title and close button */}
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-black uppercase">
                    {view === "join"
                      ? "JOIN IN! 🚀"
                      : view === "login"
                        ? "WELCOME BACK! 🔐"
                        : "FORGOT CODE? 🔑"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-3 border-black bg-negative text-lg font-black text-white shadow-[2px_2px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[0px_0px_0px_#000]"
                  >
                    ✕
                  </button>
                </div>

                {/* Separator */}
                <div className="my-4 border-t-3 border-black" />

                <AnimatePresence mode="wait">
                  {view === "join" ? (
                    <motion.div
                      key="join"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      className="flex flex-col gap-4"
                    >
                      {/* Username */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          USERNAME
                        </label>
                        <input
                          type="text"
                          placeholder="CoolCat99"
                          value={username}
                          onChange={(e) =>
                            setUsername(
                              e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                            )
                          }
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                          maxLength={20}
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          PHONE NUMBER
                        </label>
                        <input
                          type="tel"
                          placeholder="999-999-9999"
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                        />
                      </div>

                      {/* Security Question */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          SECURITY QUESTION
                        </label>
                        <select
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                        >
                          <option value="">Select a question...</option>
                          {SECURITY_QUESTIONS.map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Security Answer */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          YOUR ANSWER
                        </label>
                        <input
                          type="text"
                          placeholder="Your answer..."
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                          maxLength={100}
                        />
                        <p className="mt-1 text-xs font-semibold text-gray-400">
                          Remember this! It helps recover your secret code.
                        </p>
                      </div>

                      {error && (
                        <p className="text-sm font-bold text-red-500">
                          {error}
                        </p>
                      )}

                      {/* LET'S GO button */}
                      <div className="mt-2">
                        <button
                          onClick={handleJoin}
                          disabled={loading}
                          className="w-full rounded-xl border-3 border-black bg-gray-200 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-gray-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50"
                        >
                          {loading ? "CREATING..." : "🚀 LET'S GO"}
                        </button>
                      </div>

                      {/* Switch to login */}
                      <p className="text-center text-xs font-bold text-gray-400">
                        Already have an account?{" "}
                        <button
                          onClick={() => {
                            setView("login");
                            setError("");
                          }}
                          className="font-black text-black underline"
                        >
                          Login here
                        </button>
                      </p>
                    </motion.div>
                  ) : view === "login" ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="flex flex-col gap-4"
                    >
                      {/* Phone Number */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          PHONE NUMBER
                        </label>
                        <input
                          type="tel"
                          placeholder="999-999-9999"
                          value={loginPhone}
                          onChange={(e) =>
                            setLoginPhone(
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                        />
                      </div>

                      {/* Secret Code */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          SECRET CODE
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. sai4821"
                          value={loginCode}
                          onChange={(e) =>
                            setLoginCode(
                              e.target.value.toLowerCase().slice(0, 7),
                            )
                          }
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-center text-lg font-black tracking-[0.2em] outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                          maxLength={7}
                        />
                      </div>

                      {error && (
                        <p className="text-sm font-bold text-red-500">
                          {error}
                        </p>
                      )}

                      {/* LET'S GO button */}
                      <div className="mt-2">
                        <button
                          onClick={handleLogin}
                          disabled={loading}
                          className="w-full rounded-xl border-3 border-black bg-gray-200 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-gray-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50"
                        >
                          {loading ? "VERIFYING..." : "🚀 LET'S GO"}
                        </button>
                      </div>

                      {/* Forgot code + Switch to join */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => {
                            setView("forgot");
                            setError("");
                          }}
                          className="text-xs font-black text-black underline"
                        >
                          Forgot your secret code?
                        </button>
                        <p className="text-xs font-bold text-gray-400">
                          Don&apos;t have an account?{" "}
                          <button
                            onClick={() => {
                              setView("join");
                              setError("");
                            }}
                            className="font-black text-black underline"
                          >
                            Join here
                          </button>
                        </p>
                      </div>
                    </motion.div>
                  ) : view === "forgot" ? (
                    /* ====== FORGOT CODE — STEP 1: ENTER PHONE ====== */
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="flex flex-col gap-4"
                    >
                      <p className="text-sm font-semibold text-gray-500">
                        Enter your phone number to recover your secret code.
                      </p>

                      {/* Phone Number */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          PHONE NUMBER
                        </label>
                        <input
                          type="tel"
                          placeholder="999-999-9999"
                          value={forgotPhone}
                          onChange={(e) =>
                            setForgotPhone(
                              e.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                        />
                      </div>

                      {error && (
                        <p className="text-sm font-bold text-red-500">
                          {error}
                        </p>
                      )}

                      <div className="mt-2">
                        <button
                          onClick={handleForgotLookup}
                          disabled={loading}
                          className="w-full rounded-xl border-3 border-black bg-gray-200 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-gray-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50"
                        >
                          {loading ? "LOOKING UP..." : "NEXT →"}
                        </button>
                      </div>

                      <p className="text-center text-xs font-bold text-gray-400">
                        Remember your code?{" "}
                        <button
                          onClick={() => {
                            setView("login");
                            setError("");
                          }}
                          className="font-black text-black underline"
                        >
                          Login here
                        </button>
                      </p>
                    </motion.div>
                  ) : (
                    /* ====== FORGOT CODE — STEP 2: ANSWER QUESTION ====== */
                    <motion.div
                      key="forgot-answer"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      className="flex flex-col gap-4"
                    >
                      {/* Security Question Display */}
                      <div className="rounded-xl border-3 border-black bg-surface-alt px-4 py-3">
                        <p className="text-xs font-bold uppercase text-gray-400">
                          YOUR SECURITY QUESTION
                        </p>
                        <p className="mt-1 text-base font-black">
                          {forgotQuestion}
                        </p>
                      </div>

                      {/* Answer Input */}
                      <div>
                        <label className="mb-1.5 block text-sm font-black uppercase">
                          YOUR ANSWER
                        </label>
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={forgotAnswer}
                          onChange={(e) => setForgotAnswer(e.target.value)}
                          className="w-full rounded-xl border-3 border-black bg-primary-light px-4 py-3 text-base font-semibold outline-none shadow-[3px_3px_0px_#000] transition-shadow focus:shadow-[5px_5px_0px_#000]"
                          maxLength={100}
                        />
                      </div>

                      {error && (
                        <p className="text-sm font-bold text-red-500">
                          {error}
                        </p>
                      )}

                      <div className="mt-2">
                        <button
                          onClick={handleForgotReset}
                          disabled={loading}
                          className="w-full rounded-xl border-3 border-black bg-gray-200 px-5 py-3.5 text-base font-black uppercase shadow-[4px_4px_0px_#000] transition-all hover:bg-gray-300 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#000] disabled:opacity-50"
                        >
                          {loading ? "VERIFYING..." : "RESET MY CODE 🔑"}
                        </button>
                      </div>

                      <p className="text-center text-xs font-bold text-gray-400">
                        <button
                          onClick={() => {
                            setView("forgot");
                            setError("");
                            setForgotAnswer("");
                          }}
                          className="font-black text-black underline"
                        >
                          ← Back
                        </button>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
