import { Navbar } from "@/components/navbar";
import { HeroBanner } from "@/components/hero-banner";
import { PersonGrid } from "@/components/person-grid";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-12">
        <HeroBanner />
        <div className="mt-6">
          <PersonGrid />
        </div>
      </main>
    </>
  );
}
