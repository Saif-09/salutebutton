"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <p className="text-6xl">💥</p>
      <h1 className="text-3xl font-black uppercase">Something went wrong</h1>
      <p className="text-lg font-semibold text-black/60">
        An unexpected error occurred.
      </p>
      <button
        onClick={reset}
        className="neo-brutal bg-white px-6 py-3 text-sm font-bold uppercase"
      >
        Try Again
      </button>
    </main>
  );
}
