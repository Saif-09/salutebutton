import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <p className="text-6xl">🫡</p>
      <h1 className="text-4xl font-black uppercase">404</h1>
      <p className="text-lg font-semibold text-black/60">
        This page went AWOL, soldier.
      </p>
      <Link
        href="/"
        className="neo-brutal bg-white px-6 py-3 text-sm font-bold uppercase"
      >
        Return to Base
      </Link>
    </main>
  );
}
