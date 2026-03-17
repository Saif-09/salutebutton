import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/constants/site";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CelebPageClient } from "./client";
import { ExploreButton } from "./explore-button";
import type { Celeb } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

async function getCeleb(id: string): Promise<Celeb | null> {
  try {
    const res = await fetch(`${API_URL}/api/celebs/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Ensure category fallback so it matches the Celeb type
    if (!data.category) {
      data.category = { _id: "", name: "Unknown", slug: "unknown" };
    }
    return data as Celeb;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const celeb = await getCeleb(id);
  if (!celeb) return {};

  const title = `${celeb.name} - SaluteButton`;
  const description = celeb.comment
    ? `"${celeb.comment}" — ${celeb.name} has ${celeb.respectors.toLocaleString()} salutes. Cast your vote!`
    : `${celeb.name} has ${celeb.respectors.toLocaleString()} salutes on SaluteButton. Cast your vote!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/celeb/${id}`,
      siteName: siteConfig.name,
      images: [
        {
          url: celeb.image,
          width: 600,
          height: 600,
          alt: celeb.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [celeb.image],
    },
  };
}

export default async function CelebPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const celeb = await getCeleb(id);
  if (!celeb) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-10 pb-12">
        <div className="mt-10 flex flex-col items-center">
          <div className="w-full max-w-sm pt-20 sm:max-w-md">
            <CelebPageClient celeb={celeb} size="large" />
          </div>
          <div className="mt-10">
            <ExploreButton />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
